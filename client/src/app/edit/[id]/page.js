'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchPost = async () => {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);
      } else {
        setError('Failed to load post data.');
      }
    };

    fetchPost();
  }, [postId]);

  const handleEdit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');

    const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    if (res.ok) {
      router.push(`/post/${postId}`);
    } else {
      const data = await res.json();
      setError(data.message || 'Failed to update post.');
    }
  };

  // Back button function
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 border rounded-xl shadow bg-[#1A1D1F]">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="mb-4 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
      >
        &larr; Back
      </button>
      <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleEdit} className="space-y-4">
        <input
          type="text"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <textarea
          placeholder="Post Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
