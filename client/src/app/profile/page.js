"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GreenButton from "@/components/GreenButton";
import VoteButtons from "@/components/VoteButtons";

const sections = ["Overview", "Posts", "Comments", "Upvoted", "Downvoted", "Friends", "Following", "Followers"];

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [upvotedPosts, setUpvotedPosts] = useState([]);
  const [downvotedPosts, setDownvotedPosts] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusInput, setStatusInput] = useState("");
  const [isHoveringStatus, setIsHoveringStatus] = useState(false);
  const fileInputRef = useRef(null);
  const statusInputRef = useRef(null);
  const router = useRouter();

  // Function to fetch user details by userId
  const fetchUserDetails = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
    }
    return null;
  };

  // Function to fetch multiple users
  const fetchUsersDetails = async (userIds, token) => {
    const promises = userIds.map(userId => fetchUserDetails(userId, token));
    const results = await Promise.all(promises);
    return results.filter(user => user !== null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    fetch("http://localhost:5000/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(async (u) => {
        setUser(u);
        setStatusInput(u.status || "");
        
        // Fetch user lists
        if (u.friends) {
          const friends = await fetchUsersDetails(u.friends, token);
          setFriendsList(friends);
        }
        if (u.following) {
          const following = await fetchUsersDetails(u.following, token);
          setFollowingList(following);
        }
        if (u.followers) {
          const followers = await fetchUsersDetails(u.followers, token);
          setFollowersList(followers);
        }

        return Promise.all([
          fetch(`http://localhost:5000/api/posts/user/${u.userId}`).then((r) =>
            r.json()
          ),
          fetch(`http://localhost:5000/api/comments/user/${u.userId}`).then(
            (r) => r.json()
          ),
          fetch(`http://localhost:5000/api/posts/upvoted/${u.userId}`).then(
            (r) => r.json()
          ),
          fetch(`http://localhost:5000/api/posts/downvoted/${u.userId}`).then(
            (r) => r.json()
          ),
        ]);
      })
      .then(([ps, cs, ups, downs]) => {
        setPosts(Array.isArray(ps) ? ps : []);
        setComments(Array.isArray(cs) ? cs : []);
        setUpvotedPosts(Array.isArray(ups) ? ups : []);
        setDownvotedPosts(Array.isArray(downs) ? downs : []);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingStatus && statusInputRef.current) {
      statusInputRef.current.focus();
    }
  }, [isEditingStatus]);

  const handleAvatarClick = () => fileInputRef.current?.click();
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append("avatar", file);
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/users/upload-avatar", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (res.ok) {
      const { avatar } = await res.json();
      setUser((u) => ({ ...u, avatar }));
    }
  };

  const handleStatusEdit = () => {
    setIsEditingStatus(true);
    setIsHoveringStatus(false);
  };

  const handleStatusSave = async () => {
    const token = localStorage.getItem("token");
    const trimmedStatus = statusInput.trim();
    
    if (!trimmedStatus) {
      alert("Status cannot be empty");
      return;
    }
    
    if (trimmedStatus.length > 150) {
      alert("Status must be 150 characters or less");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/update-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: trimmedStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser((u) => ({ ...u, status: data.status }));
        setIsEditingStatus(false);
      } else {
        const error = await res.json();
        alert(error.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleStatusCancel = () => {
    setStatusInput(user.status || "");
    setIsEditingStatus(false);
  };

  const handleStatusKeyPress = (e) => {
    if (e.key === "Enter") {
      handleStatusSave();
    } else if (e.key === "Escape") {
      handleStatusCancel();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading…
      </div>
    );
  }

  const listData = {
    Posts: posts,
    Upvoted: upvotedPosts,
    Downvoted: downvotedPosts,
  };

  return (
    <div className="min-h-screen bg-[#0E1113] flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-4xl rounded-xl p-8 shadow-2xl transform transition hover:scale-[1.02]">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div
              onClick={handleAvatarClick}
              className="relative w-24 h-24 rounded-full border-4 border-[#22B205] overflow-hidden cursor-pointer hover:opacity-80 transition"
            >
              <Image
                src={
                  user.avatar?.startsWith("/uploads")
                    ? `http://localhost:5000${user.avatar}`
                    : user.avatar || "/profile_picture_user_icon_153847.ico"
                }
                alt="avatar"
                fill
                className="object-cover"
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#22B205]">
                {user.userId}
              </h1>
              <p className="text-gray-400">{user.title}</p>
              
              {/* Editable Status */}
              <div className="relative mt-1">
                {isEditingStatus ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={statusInputRef}
                      type="text"
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      onKeyDown={handleStatusKeyPress}
                      onBlur={handleStatusCancel}
                      className="text-sm text-[#22B205] bg-gray-800 border border-[#22B205] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#22B205] max-w-xs"
                      placeholder="Enter your status..."
                      maxLength={150}
                    />
                    <GreenButton
                      onClick={handleStatusSave}
                      sx={{
                        textTransform: "none",
                        backgroundColor: "#22B205",
                        color: "white",
                        "&:hover": { backgroundColor: "#166B04" },
                        minWidth: "auto",
                        fontSize: "0.75rem",
                        padding: "4px 12px",
                      }}
                    >
                      Save
                    </GreenButton>
                    <GreenButton
                      onClick={handleStatusCancel}
                      variant="outlined"
                      sx={{
                        textTransform: "none",
                        borderColor: "#666",
                        color: "#999",
                        "&:hover": { 
                          backgroundColor: "#333",
                          borderColor: "#999",
                          color: "white"
                        },
                        minWidth: "auto",
                        fontSize: "0.75rem",
                        padding: "4px 12px",
                      }}
                    >
                      Cancel
                    </GreenButton>
                  </div>
                ) : (
                  <div
                    className="relative inline-block"
                    onMouseEnter={() => setIsHoveringStatus(true)}
                    onMouseLeave={() => setIsHoveringStatus(false)}
                    onClick={handleStatusEdit}
                  >
                    <p className="text-sm text-[#22B205] cursor-pointer hover:text-white transition">
                      {user.status}
                    </p>
                    {isHoveringStatus && (
                      <div
                        className="absolute -right-8 top-0 text-gray-400 transition"
                        title="Click to edit status"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <GreenButton
            onClick={() => router.push("/")}
            sx={{
              textTransform: "none",
              backgroundColor: "#22B205",
              color: "white",
              "&:hover": { backgroundColor: "#166B04" },
            }}
          >
            Back to Home
          </GreenButton>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 text-center text-white">
          {[
            { key: "friends", label: "Friends" },
            { key: "following", label: "Following" },
            { key: "followers", label: "Followers" }
          ].map(({ key, label }) => (
            <div 
              key={key}
              className="cursor-pointer hover:bg-gray-800 rounded-lg p-4 transition-colors"
              onClick={() => setActiveTab(label)}
            >
              <p className="text-2xl font-bold text-[#22B205]">
                {user[key]?.length ?? 0}
              </p>
              <p className="text-gray-400 capitalize">{label}</p>
            </div>
          ))}
        </div>
        <div className="h-4" />

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-700">
          <nav className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {sections.map((sec) => (
              <GreenButton
                key={sec}
                variant="outlined"
                onClick={() => setActiveTab(sec)}
                sx={{
                  justifyContent: "center",
                  py: 1,
                  textTransform: "none",
                  fontSize: "0.75rem",
                  borderColor: activeTab === sec ? "#22B205" : "transparent",
                  color: activeTab === sec ? "white" : "gray",
                  "&:hover": {
                    backgroundColor:
                      activeTab === sec ? "rgba(34,178,5,0.08)" : "transparent",
                  },
                }}
              >
                {sec}
              </GreenButton>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === "Overview" && (
            <div className="text-white space-y-4">
              <div className="h-3" />
              <p>
                <strong className="text-[#22B205]">Joined:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong className="text-[#22B205]">Title:</strong> {user.title}
              </p>
              <p>
                <strong className="text-[#22B205]">Leaderboard:</strong> #123
                (WIP)
              </p>
            </div>
          )}

          {["Posts", "Upvoted", "Downvoted"].includes(activeTab) && (
            <div className="space-y-4">
              {listData[activeTab].length === 0 ? (
                <p className="text-gray-400 text-center">
                  No {activeTab.toLowerCase()} yet.
                </p>
              ) : (
                listData[activeTab].map((item, idx, arr) => (
                  <div key={item._id}>
                    <div className="h-3" />
                    <div className="rounded-xl p-4 hover:border-2 hover:border-[#166B04] hover:shadow-lg transition">
                      <Link href={`/post/${item._id}`}>
                        <h3 className="inline-block text-xl font-semibold text-[#22B205] hover:underline">
                          {item.title}
                        </h3>
                      </Link>
                      <span className="text-gray-400 ml-2">
                        • {new Date(item.createdAt).toLocaleString()}
                      </span>
                      {activeTab === "Posts" && (
                        <div className="mt-2">
                          <VoteButtons
                            upvotes={
                              item.upvotes || item.votes?.upvotedBy?.length
                            }
                            downvotes={
                              item.downvotes || item.votes?.downvotedBy?.length
                            }
                            userVote={item.userVote}
                          />
                        </div>
                      )}
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="w-full h-px bg-gray-500 opacity-30 my-4" />
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "Comments" && (
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-400 text-center">No comments yet.</p>
              ) : (
                comments.map((c, idx) => (
                  <div key={c._id}>
                    <div className="h-3" />
                    <div className="rounded-xl p-4 hover:border-2 hover:border-[#166B04] hover:shadow-lg transition">
                      <Link href={`/post/${c.postId}`}>
                        <span className="text-gray-400 text-sm hover:underline">
                          {c.author} • {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </Link>
                      <p className="text-white mt-1">{c.content}</p>
                    </div>
                    {idx < comments.length - 1 && (
                      <div className="w-full h-px bg-gray-500 opacity-30 my-4" />
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "Friends" && (
            <div className="space-y-4">
              {friendsList.length === 0 ? (
                <p className="text-gray-400 text-center">No friends yet.</p>
              ) : (
                friendsList.map((friend, idx) => (
                  <div key={friend.userId}>
                    <div className="h-3" />
                    <div className="rounded-xl p-4 hover:border-2 hover:border-[#166B04] hover:shadow-lg transition">
                      <Link href={`/profile/${friend.userId}`}>
                        <div className="flex items-center gap-4">
                          <Image
                            src={
                              friend.avatar?.startsWith("/uploads")
                                ? `http://localhost:5000${friend.avatar}`
                                : friend.avatar || "/profile_picture_user_icon_153847.ico"
                            }
                            alt="avatar"
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-[#22B205] hover:underline">
                              {friend.userId}
                            </h3>
                            <p className="text-gray-400 text-sm">{friend.status}</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                    {idx < friendsList.length - 1 && (
                      <div className="w-full h-px bg-gray-500 opacity-30 my-4" />
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "Following" && (
            <div className="space-y-4">
              {followingList.length === 0 ? (
                <p className="text-gray-400 text-center">Not following anyone yet.</p>
              ) : (
                followingList.map((following, idx) => (
                  <div key={following.userId}>
                    <div className="h-3" />
                    <div className="rounded-xl p-4 hover:border-2 hover:border-[#166B04] hover:shadow-lg transition">
                      <Link href={`/profile/${following.userId}`}>
                        <div className="flex items-center gap-4">
                          <Image
                            src={
                              following.avatar?.startsWith("/uploads")
                                ? `http://localhost:5000${following.avatar}`
                                : following.avatar || "/profile_picture_user_icon_153847.ico"
                            }
                            alt="avatar"
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-[#22B205] hover:underline">
                              {following.userId}
                            </h3>
                            <p className="text-gray-400 text-sm">{following.status}</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                    {idx < followingList.length - 1 && (
                      <div className="w-full h-px bg-gray-500 opacity-30 my-4" />
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "Followers" && (
            <div className="space-y-4">
              {followersList.length === 0 ? (
                <p className="text-gray-400 text-center">No followers yet.</p>
              ) : (
                followersList.map((follower, idx) => (
                  <div key={follower.userId}>
                    <div className="h-3" />
                    <div className="rounded-xl p-4 hover:border-2 hover:border-[#166B04] hover:shadow-lg transition">
                      <Link href={`/profile/${follower.userId}`}>
                        <div className="flex items-center gap-4">
                          <Image
                            src={
                              follower.avatar?.startsWith("/uploads")
                                ? `http://localhost:5000${follower.avatar}`
                                : follower.avatar || "/profile_picture_user_icon_153847.ico"
                            }
                            alt="avatar"
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-[#22B205] hover:underline">
                              {follower.userId}
                            </h3>
                            <p className="text-gray-400 text-sm">{follower.status}</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                    {idx < followersList.length - 1 && (
                      <div className="w-full h-px bg-gray-500 opacity-30 my-4" />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}