"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import VoteButtons from "@/components/VoteButtons";
import GreenButton from "@/components/GreenButton";

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const [votingPost, setVotingPost] = useState(false);
  const [votingComments, setVotingComments] = useState({});
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken || "");

    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        setUser(decoded);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }

    const fetchPost = async () => {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      const data = await res.json();
      data.upvotes = data.upvotes || 0;
      data.downvotes = data.downvotes || 0;
      console.log("Post data:", data); // Log the post data to see what properties are available
      setPost(data);
    };

    const fetchComments = async () => {
      const res = await fetch(`http://localhost:5000/api/comments/${postId}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      const data = await res.json();
      console.log("Raw comments data:", data); // Add this to see what's coming from API
      const formatted = data.map((c) => ({
        ...c,
        upvotes: c.upvotes || 0,
        downvotes: c.downvotes || 0,
      }));
      console.log("Formatted comments:", formatted); // Add this to verify
      setComments(formatted);
      setFilteredComments(formatted);
    };

    fetchPost();
    fetchComments();

    if (storedToken) {
      const fetchProfile = async () => {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        const data = await res.json();
        setProfileData(data);
      };
      fetchProfile();
    }
  }, [postId]);

  useEffect(() => {
    const lower = search.toLowerCase();
    const result = comments.filter((c) =>
      c.content.toLowerCase().includes(lower)
    );
    setFilteredComments(result);
  }, [search, comments]);

  const handleComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    const res = await fetch(`http://localhost:5000/api/comments/${postId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: commentText,
      }),
    });

    if (res.ok) {
      setCommentText("");
      const data = await res.json();
      const newComment = data.comment;
      newComment.upvotes = newComment.upvotes || 0;
      newComment.downvotes = newComment.downvotes || 0;
      setComments((prev) => [newComment, ...prev]);
    }
  };

  const handleVotePost = async (voteType) => {
    if (!token) return;

    setVotingPost(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/${postId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ voteType }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setPost((prevPost) => ({
          ...prevPost,
          upvotes: updated.upvotes,
          downvotes: updated.downvotes,
          userVote: prevPost.userVote === voteType ? null : voteType,
        }));
      } else {
        console.error("Failed to vote on post");
      }
    } catch (error) {
      console.error("Error voting on post:", error);
    } finally {
      setVotingPost(false);
    }
  };

  const handleVoteComment = async (commentId, voteType) => {
    if (!token) return;

    setVotingComments((prev) => ({ ...prev, [commentId]: true }));

    try {
      const res = await fetch(
        `http://localhost:5000/api/comments/vote/${commentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ voteType }),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  upvotes: updated.upvotes,
                  downvotes: updated.downvotes,
                  userVote: comment.userVote === voteType ? null : voteType, // Same toggle logic as posts
                }
              : comment
          )
        );
        setFilteredComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  upvotes: updated.upvotes,
                  downvotes: updated.downvotes,
                  userVote: comment.userVote === voteType ? null : voteType,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("Error voting on comment:", error);
    } finally {
      setVotingComments((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setProfileData(null);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#0E1113] p-4 sm:p-8">
      <div className="h-2" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 pr-8">
        <div className="flex items-center gap-4">
          {profileData?.avatar && (
            <Link href="/profile">
              <img
                src={`http://localhost:5000${profileData.avatar}`}
                alt="Profile"
                className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity duration-200"
              />
            </Link>
          )}
          <span className="text-white text-lg">
            Hello,{" "}
            <span className="text-[#22B205]">
              {profileData ? profileData.userId : "Guest"}
            </span>
          </span>
        </div>

        {/* Auth Buttons */}
        <div className="flex gap-3 px-2 py-1">
          {token ? (
            <GreenButton
              startIcon={<LogOut />}
              onClick={handleLogout}
              sx={{
                textTransform: "none",
                fontSize: "0.9rem",
                fontWeight: "light",
                borderColor: "#22B205",
                "& .MuiButton-startIcon": {
                  color: "#22B205",
                },
              }}
            >
              Logout &nbsp;
            </GreenButton>
          ) : (
            <>
              <Link href="/login">
                <GreenButton
                  startIcon={<LogIn />}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.9rem",
                    fontWeight: "light",
                    borderColor: "#22B205",
                    "& .MuiButton-startIcon": {
                      color: "#22B205",
                    },
                  }}
                >
                  Login
                </GreenButton>
              </Link>
              <Link href="/register">
                <GreenButton
                  startIcon={<UserPlus />}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.9rem",
                    fontWeight: "light",
                    borderColor: "#22B205",
                    "& .MuiButton-startIcon": {
                      color: "#22B205",
                    },
                  }}
                >
                  Register &nbsp;
                </GreenButton>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Search with updated neon mist effect */}
      <div className="flex justify-center mb-10">
        <div className="relative w-full max-w-md group">
          <input
            type="text"
            placeholder={focused ? "" : "Search Comments"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="
        w-full px-4 py-2 rounded-lg bg-[#2D2F32] text-white placeholder-gray-500
        outline-none transition-all duration-300
        text-center
        shadow-[0_2px_15px_rgba(34,178,5,0.2)]
        hover:shadow-[0_4px_20px_rgba(34,178,5,0.35)]
        hover:translate-y-[-2px]
        focus:shadow-[0_4px_20px_rgba(34,178,5,0.4)]
        focus:translate-y-[-2px]
        border border-transparent
        hover:border-[#22B205] hover:border-opacity-70
        focus:border-[#22B205] focus:border-opacity-0
      "
          />
        </div>
      </div>

      <div className="h-4" />

      {/* Post Content */}
      {!post ? (
        <div className="flex justify-center">
          <p className="text-white">Loading post...</p>
        </div>
      ) : (
        <div className="flex justify-center w-full">
          <div className="relative w-full max-w-5xl">
            <div
              className="
        rounded-xl overflow-hidden
        bg-[#0E1113]
        border-2 border-[#166B04]
        shadow-[0_4px_20px_rgba(22,107,4,0.2)]
        p-6 mb-12
        "
            >
              {/* Add the back button here at the top left */}
              <div className="flex justify-start w-full mb-4">
                <GreenButton
                  startIcon={<ArrowLeft />}
                  onClick={handleBack}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.9rem",
                    fontWeight: "light",
                    borderColor: "#22B205",
                    "& .MuiButton-startIcon": {
                      color: "#22B205",
                    },
                  }}
                >
                  Back to Feed
                </GreenButton>
              </div>
              <div className="h-2"></div>
              <h1 className="text-2xl font-bold text-[#189C46] mb-2">
                {post.title}
              </h1>
              <p className="text-sm text-gray-500 mb-2">
                by{" "}
                <Link
                  href={`/profile/${post.author}`}
                  className="text-[#22B205] hover:underline"
                >
                  {post.author}
                </Link>{" "}
                • {new Date(post.createdAt).toLocaleString()}
              </p>
              <p className="text-gray-300 mb-6">{post.content}</p>

              {/* Post Voting */}
              <div className="mt-4 flex gap-4">
                <VoteButtons
                  upvotes={post.upvotes}
                  downvotes={post.downvotes}
                  userVote={post.userVote}
                  disabled={votingPost}
                  onVote={(type) => handleVotePost(type)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Form */}
      <div className="h-4"></div>
      <div className="flex justify-center w-full">
        <div className="relative w-full max-w-5xl mb-12">
          <form onSubmit={handleComment} className="flex flex-col">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="
    w-full p-4 mb-4 rounded-xl 
    bg-[#2D2F32] text-white placeholder-gray-500
    border-2 border-[#166B04] outline-none 
    transition-all duration-300
    shadow-[0_4px_20px_rgba(22,107,4,0.2)]
    hover:border-[#22B205] 
    hover:shadow-[0_4px_20px_rgba(34,178,5,0.4)]
    focus:shadow-[0_4px_25px_rgba(34,178,5,0.5)]
    min-h-[100px]
  "
            />
            <div className="h-4"></div>
            <div className="flex justify-end">
              <GreenButton
                type="submit"
                disabled={!token}
                sx={{
                  textTransform: "none",
                  fontSize: "0.9rem",
                  fontWeight: "light",
                  borderColor: "#22B205",
                  backgroundColor: token ? "#22B205" : "transparent",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#166B04",
                    boxShadow: "0 4px 20px rgba(22,107,4,0.2)",
                  },
                  "& .MuiButton-startIcon": {
                    color: "#22B205",
                  },
                }}
              >
                {token ? "Post Comment" : "Login to Comment"}
              </GreenButton>
            </div>
          </form>
        </div>
      </div>

      {/* Comments Section */}
      <div className="flex justify-center w-full">
        <div className="relative w-full max-w-5xl">
          <h2 className="text-xl font-semibold text-[#189C46] mb-6">
            💬 Comments ({filteredComments.length})
          </h2>
          <div className="h-3"></div>

          {filteredComments.length === 0 ? (
            <p className="text-gray-500 text-center">
              {search
                ? "No comments match your search."
                : "No comments yet. Be the first to comment!"}
            </p>
          ) : (
            filteredComments.map((comment, index) => (
              <div key={comment._id || index}>
                <div
                  className="
                  rounded-xl overflow-hidden
                  bg-[#0E1113]
                  border-2 border-[#166B04]
                  shadow-[0_4px_20px_rgba(22,107,4,0.2)]
                  p-4 mb-4
                  transition-all duration-200 group
                  hover:border-[#22B205]
                  hover:shadow-[0_4px_20px_rgba(22,107,4,0.4)]
                  hover:-translate-y-1
                "
                >
                  <p className="text-sm text-gray-500 mb-1">
                    by{" "}
                    <Link
                      href={`/profile/${comment.author}`}
                      className="text-[#22B205] hover:underline"
                    >
                      {comment.author}
                    </Link>{" "}
                    • {new Date(comment.createdAt).toLocaleString()}
                  </p>
                  <p className="text-gray-300 mb-3">{comment.content}</p>

                  {/* Comment Voting */}
                  <div className="flex gap-4">
                    <VoteButtons
                      upvotes={comment.upvotes}
                      downvotes={comment.downvotes}
                      userVote={comment.userVote}
                      disabled={votingComments[comment._id]}
                      onVote={(type) => handleVoteComment(comment._id, type)}
                    />
                  </div>
                </div>

                {/* Extra space between comments */}
                <div className="h-4"></div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
