"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GreenButton from "@/components/GreenButton";
import VoteButtons from "@/components/VoteButtons";

const sections = ["Overview", "Posts", "Comments", "Upvoted", "Downvoted"];

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [upvotedPosts, setUpvotedPosts] = useState([]);
  const [downvotedPosts, setDownvotedPosts] = useState([]);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    fetch("http://localhost:5000/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((u) => {
        setUser(u);
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
              <p className="text-sm text-[#22B205] mt-1">{user.status}</p>
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
          {["friends", "following", "followers"].map((key) => (
            <div key={key}>
              <p className="text-2xl font-bold text-[#22B205]">
                {user[key]?.length ?? 0}
              </p>
              <p className="text-gray-400 capitalize">{key}</p>
            </div>
          ))}
        </div>
        <div className="h-4" />

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-700">
          <nav className="grid grid-cols-5 gap-4">
            {sections.map((sec) => (
              <GreenButton
                key={sec}
                variant="outlined"
                onClick={() => setActiveTab(sec)}
                sx={{
                  justifyContent: "center",
                  py: 1,
                  textTransform: "none",
                  fontSize: "0.875rem",
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
                        \
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
                        \
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
        </div>
      </div>
    </div>
  );
}
