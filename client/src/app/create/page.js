"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GreenButton from "@/components/GreenButton";
import { ArrowLeft } from "lucide-react";

export default function CreatePost() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to create a post.");
      return;
    }

    const res = await fetch("http://localhost:5000/api/posts/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      const data = await res.json();
      setError(data.message || "Failed to create post.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1113] flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-lg rounded-xl p-8 shadow-2xl transform transition hover:scale-[1.02]">
        {/* Back */}
        <GreenButton
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={() => router.back()}
          sx={{
            textTransform: "none",
            borderColor: "#22B205",
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(34,178,5,0.08)",
              boxShadow: "0 0 20px rgba(34,178,5,0.4)",
            },
            mb: 2,
          }}
        >
          Back to Home
        </GreenButton>

        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Create New Post
        </h1>
        <div className="h-4" />

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#2D2F32] text-center text-white outline-none transition duration-300 hover:shadow-[0_0_20px_rgba(34,178,5,0.4)] focus:shadow-[0_0_20px_rgba(34,178,5,0.6)] active:shadow-[0_0_30px_rgba(34,178,5,0.8)]"
          />
          <div className="h-1" />

          <textarea
            placeholder="Post Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-lg bg-[#2D2F32] text-white outline-none transition duration-300 resize-none hover:shadow-[0_0_20px_rgba(34,178,5,0.4)] focus:shadow-[0_0_20px_rgba(34,178,5,0.6)] active:shadow-[0_0_30px_rgba(34,178,5,0.8)]"
          />

          <GreenButton
            type="submit"
            fullWidth
            sx={{
              textTransform: "none",
              backgroundColor: "#22B205",
              color: "white",
              py: 1.5,
              "&:hover": { backgroundColor: "#166B04" },
            }}
          >
            Post
          </GreenButton>
        </form>
      </div>
    </div>
  );
}
