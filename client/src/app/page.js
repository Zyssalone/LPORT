"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { ThumbsUp, ThumbsDown, LogIn, LogOut, UserPlus } from "lucide-react";
import VoteButtons from "@/components/VoteButtons";
import GreenButton from "@/components/GreenButton";


export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [votingPosts, setVotingPosts] = useState({});
  const [focused, setFocused] = useState(false);
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

    const fetchPosts = async () => {
      const res = await fetch("http://localhost:5000/api/posts", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      const data = await res.json();
      setPosts(data);
      setFiltered(data);
    };

    fetchPosts();

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
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    const result = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.content.toLowerCase().includes(lower)
    );
    setFiltered(result);
  }, [search, posts]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setProfileData(null);
  };

  const handleVote = async (postId, voteType) => {
    if (!token) return;

    setVotingPosts((prev) => ({ ...prev, [postId]: true }));

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
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  upvotes: updated.upvotes,
                  downvotes: updated.downvotes,
                  userVote: post.userVote === voteType ? null : voteType,
                }
              : post
          )
        );
        setFiltered((prev) =>
          prev.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  upvotes: updated.upvotes,
                  downvotes: updated.downvotes,
                  userVote: post.userVote === voteType ? null : voteType,
                }
              : post
          )
        );
      } else {
        console.error("Failed to vote on post");
      }
    } catch (error) {
      console.error("Error voting on post:", error);
    } finally {
      setVotingPosts((prev) => ({ ...prev, [postId]: false }));
    }
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

      {/* Search */}
      <div className="flex justify-center mb-10">
        <div className="relative w-full max-w-md group">
          {/* Input with hover effect */}
          <input
            type="text"
            placeholder={focused ? "" : "Search"}
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

      {/* Feed */}
      <div>
        
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center">No posts found.</p>
        ) : (
          filtered.map((post, index) => (
            <div key={post._id}>
              <div className="flex justify-center w-full">
                {/* wrapper to apply padding & extra width */}
                <div className="relative w-full max-w-5xl p-4">
                  <div
                    className={`
              rounded-xl overflow-hidden
              bg-[#0E1113]
              transition-all duration-200 group
              hover:border-2 hover:border-[#166B04]
              hover:shadow-[0_4px_20px_rgba(22,107,4,0.2)]
              hover:-translate-y-1
            `}
                  >
                    {/* Post link */}
                    
                    <Link href={`/post/${post._id}`} passHref>
                      <div className="p-4 cursor-pointer">
                        <h2 className="text-xl font-semibold text-[#189C46] group-hover:underline">
                          {post.title}
                        </h2>
                        <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                          {/* Author profile picture and username */}
                          {post.authorAvatar && (
                            <Link href={`/profile/${post.author}`}>
                              <img
                                src={`http://localhost:5000${post.authorAvatar}`}
                                alt="author-avatar"
                                className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity duration-200"
                              />
                            </Link>
                          )}
                          <span>
                            by{" "}
                            <Link href={`/profile/${post.author}`}>
                              <span className="text-[#22B205] cursor-pointer hover:underline">
                                {post.author}
                              </span>
                            </Link>
                          </span>{" "}
                          • {new Date(post.createdAt).toLocaleString()}
                        </p>
                        <p className="text-gray-300">{post.content}</p>
                      </div>
                    </Link>

                    {/* Voting buttons */}
                    <div className="h-3" />
                    <div className="mt-4 flex gap-4">
                      <VoteButtons
                        upvotes={post.upvotes}
                        downvotes={post.downvotes}
                        userVote={post.userVote}
                        disabled={votingPosts[post._id]}
                        onVote={(type, e) => {
                          if (e) e.stopPropagation();
                          handleVote(post._id, type);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-2" />
              {/* Separator */}
              {index !== filtered.length - 1 && (
                <div className="flex justify-center w-full my-6">
                  <div className="w-full max-w-5xl h-px bg-gray-500 opacity-30" />
                  <div className="h-3" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
