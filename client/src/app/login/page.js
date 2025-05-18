"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GreenButton from "@/components/GreenButton";

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        router.push("/");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1113] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#22B205] mb-2">
            Connect with AUIERS
          </h1>
          <p className="text-gray-400">Sign in to access your account</p>
          <div className="h-4"></div>
        </div>

        {/* Form container with neon glow effect */}
        <div className="relative rounded-xl p-1 overflow-hidden">
          {/* Neon border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#22B205] via-[#3DFF33] to-[#22B205] opacity-50 blur-sm animate-pulse"></div>

          {/* Form content */}
          <div className="relative bg-[#0E1113] rounded-lg p-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="User ID"
                    className="
    w-full py-4 px-5 text-white bg-[#2D2F32]
    rounded-xl text-center text-lg placeholder:text-center placeholder:text-lg placeholder-gray-400
    outline-none border-none
    transition duration-300 ease-in-out
    focus:shadow-[0_0_15px_rgba(34,178,5,0.4)]
    focus:bg-[#2D2F32]
  "
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                <div className="h-8"></div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    className="
    w-full py-4 px-5 text-white bg-[#2D2F32]
    rounded-xl text-center text-lg placeholder:text-center placeholder:text-lg placeholder-gray-400
    outline-none border-none
    transition duration-300 ease-in-out
    focus:shadow-[0_0_15px_rgba(34,178,5,0.4)]
    focus:bg-[#2D2F32]
  "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="h-4"></div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <div className="flex flex-col space-y-4">
                <GreenButton
                  type="submit"
                  sx={{
                    width: "100%",
                    textTransform: "none",
                    fontSize: "1.1rem",
                    fontWeight: "medium",
                    backgroundColor: "#22B205",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#166B04",
                    },
                    py: 2.5,
                  }}
                >
                  Log In
                </GreenButton>

                <div className="flex items-center justify-center space-x-2">
                  <span className="h-px bg-gray-600 flex-1"></span>
                  <span className="text-gray-400 px-2 text-sm">or</span>
                  <span className="h-px bg-gray-600 flex-1"></span>
                </div>

                <Link href="/register" className="w-full">
                  <GreenButton
                    sx={{
                      width: "100%",
                      textTransform: "none",
                      fontSize: "1.1rem",
                      fontWeight: "medium",
                      borderColor: "#22B205",
                      color: "#22B205",
                      "&:hover": {
                        borderColor: "#166B04",
                        color: "#166B04",
                      },
                      py: 2.5,
                    }}
                  >
                    Create New Account
                  </GreenButton>
                </Link>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>
            Forgot your password?{" "}
            <Link
              href="/reset-password"
              className="text-[#22B205] hover:underline"
            >
              Reset it
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
