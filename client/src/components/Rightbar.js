"use client";

import { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";

export default function Rightbar() {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [ws, setWs] = useState(null);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = token ? jwtDecode(token).userId : null;
  console.log("Decoded userId:", userId); // Check if this matches your DB

  // Fetch friends list with error handling
  useEffect(() => {
    if (!token) return;

    const fetchFriends = async () => {
      setLoadingFriends(true);
      try {
        console.log("Fetching friends with token:", token); // Debug token
        const response = await fetch(
          "http://localhost:5000/api/users/friends",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Response status:", response.status); // Debug status

        if (!response.ok) {
          const errorData = await response.json(); // Get backend error message
          throw new Error(errorData.message || "Failed to fetch friends");
        }

        const data = await response.json();
        console.log("Friends data:", data); // Debug response
        setFriends(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoadingFriends(false);
      }
    };

    fetchFriends();
  }, [token]);

  // WebSocket connection with error handling
  useEffect(() => {
    if (!token) return;

    let socket;
    try {
      socket = new WebSocket(`ws://localhost:5000?token=${token}`);

      socket.onopen = () => {
        setWs(socket);
        setError(null);
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setMessages((prev) => [...prev, message]);
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Connection error");
      };

      socket.onclose = () => {
        setWs(null);
      };
    } catch (err) {
      console.error("WebSocket connection error:", err);
      setError("Failed to connect to chat");
    }

    return () => {
      if (socket) socket.close();
    };
  }, [token]);

  // Load chat history when friend is selected
  useEffect(() => {
    if (!selectedFriend || !token) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:5000/api/users/chat/${selectedFriend}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load messages");
        }

        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedFriend, token]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !ws || !selectedFriend) return;

    try {
      const message = {
        recipientId: selectedFriend,
        content: newMessage.trim(),
      };

      ws.send(JSON.stringify(message));

      setMessages((prev) => [
        ...prev,
        {
          ...message,
          senderId: userId,
          timestamp: new Date().toISOString(),
        },
      ]);

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    }
  };

  return (
    <div className="w-64 p-4 border-l h-screen bg-[#0E1113] flex flex-col">
      <h2 className="text-lg font-bold mb-4">Chat</h2>

      {/* Error display */}
      {error && (
        <div className="text-red-500 text-sm mb-4 p-2 bg-red-500/10 rounded">
          {error}
        </div>
      )}

      {/* Friends List */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Friends</h3>
        {loadingFriends ? (
          <div className="text-gray-500 text-sm">Loading friends...</div>
        ) : (
          <div className="space-y-1">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <div
                  key={friend}
                  onClick={() => setSelectedFriend(friend)}
                  className={`p-2 rounded cursor-pointer ${
                    selectedFriend === friend
                      ? "bg-[#22B205]/20"
                      : "hover:bg-[#1E1E1E]"
                  }`}
                >
                  {friend}
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm">No friends available</div>
            )}
          </div>
        )}
      </div>

      {/* Chat Area */}
      {selectedFriend && (
        <div className="flex-1 flex flex-col border-t border-gray-700 pt-2">
          {loadingMessages ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto mb-2 space-y-2">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg max-w-[80%] ${
                      msg.senderId === userId
                        ? "ml-auto bg-[#22B205]/20"
                        : "mr-auto bg-[#1E1E1E]"
                    }`}
                  >
                    {msg.content}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 bg-[#1E1E1E] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#22B205]"
                  placeholder="Type a message..."
                  disabled={!ws}
                />
                <button
                  onClick={sendMessage}
                  className="bg-[#22B205] hover:bg-[#166B04] rounded px-3 py-2 text-sm disabled:opacity-50"
                  disabled={!newMessage.trim() || !ws}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
