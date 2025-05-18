import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import GreenButton from "@/components/GreenButton";
import { jwtDecode } from "jwt-decode";

export default function ProfileClient({ userId }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    setIsLoggedIn(!!storedToken);
  }, []);

  // Fetch user data with relationship status
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/users/${encodeURIComponent(userId)}?t=${Date.now()}`
        );
        const data = await response.json();
        
        if (data) {
          setUser(data);
          if (token) {
            const decoded = jwtDecode(token);
            updateRelationshipStatus(decoded.userId, data);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, token]);

  // Update relationship states
  const updateRelationshipStatus = (currentUserId, userData) => {
    setIsFollowing(userData.followers?.includes(currentUserId));
    setIsFriend(userData.friends?.includes(currentUserId));
  };

  // Handle follow/unfollow actions
  const handleFollowAction = async (action) => {
    if (!isLoggedIn) {
      alert("Please log in to perform this action.");
      return;
    }

    setLoading(true);
    try {
      const decoded = jwtDecode(token);
      const endpoint = action;
      
      const response = await fetch(`http://localhost:5000/api/users/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          followerId: decoded.userId,
          followeeId: user.userId 
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      // Refresh data after successful action
      const freshData = await fetch(
        `http://localhost:5000/api/users/${encodeURIComponent(userId)}?t=${Date.now()}`
      ).then(res => res.json());
      
      setUser(freshData);
      updateRelationshipStatus(decoded.userId, freshData);
    } catch (error) {
      console.error(`${action} error:`, error);
      alert(`Failed to ${action} user`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        User not found.
      </div>
    );
  }

  const currentUserId = token ? jwtDecode(token).userId : null;
  const isCurrentUser = user.userId === currentUserId;

  return (
    <div className="min-h-screen bg-[#0E1113] flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-4xl rounded-xl p-8 shadow-2xl transform transition hover:scale-[1.02]">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full border-4 border-[#22B205] overflow-hidden">
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
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#22B205]">{user.userId}</h1>
              <p className="text-gray-400">{user.title}</p>
              <p className="text-sm text-[#22B205] mt-1">{user.status}</p>
            </div>
          </div>
          <div className="flex gap-4">
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
        </div>

        {/* Relationship Actions */}
        {isLoggedIn && !isCurrentUser && (
          <div className="mt-4 flex justify-center gap-4">
            <GreenButton
              onClick={() => handleFollowAction(isFollowing ? "unfollow" : "follow")}
              disabled={loading}
              sx={{
                textTransform: "none",
                backgroundColor: isFollowing ? "#FF6347" : "#22B205",
                color: "white",
                "&:hover": { 
                  backgroundColor: isFollowing ? "#D32F2F" : "#166B04" 
                },
                "&:disabled": { opacity: 0.7 }
              }}
            >
              {loading ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}
            </GreenButton>
          </div>
        )}

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

        {/* Overview info */}
        <div className="mt-10 text-white space-y-4">
          <p>
            <strong className="text-[#22B205]">Joined:</strong>{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <p>
            <strong className="text-[#22B205]">Title:</strong> {user.title}
          </p>
          <p>
            <strong className="text-[#22B205]">Status:</strong> {user.status}
          </p>
          {isFriend && (
            <p className="text-[#22B205] font-bold">
              ✓ You are friends with this user
            </p>
          )}
        </div>
      </div>
    </div>
  );
}