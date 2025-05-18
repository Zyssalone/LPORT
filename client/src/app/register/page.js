"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GreenButton from "@/components/GreenButton";

export default function RegisterPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid:
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar,
      messages: [
        password.length >= minLength
          ? ""
          : `Password must be at least ${minLength} characters`,
        hasUpperCase
          ? ""
          : "Password must contain at least one uppercase letter",
        hasLowerCase
          ? ""
          : "Password must contain at least one lowercase letter",
        hasNumber ? "" : "Password must contain at least one number",
        hasSpecialChar
          ? ""
          : "Password must contain at least one special character",
      ].filter((msg) => msg !== ""),
    };
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (userId.length < 3 || userId.length > 20) {
      setError("Username must be between 3 and 20 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.messages.join(". "));
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Optionally auto-login after registering
        const loginRes = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, password }),
        });
        const loginData = await loginRes.json();

        if (loginRes.ok) {
          localStorage.setItem("token", loginData.token);
          router.push("/");
        } else {
          setError("Registered but auto-login failed");
        }
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1113] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#22B205] mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-400">Sign up to join AUIERS</p>
          <div className="h-4" />
        </div>

        {/* Main container - simplified without neon borders */}
        <div className="relative bg-[#0E1113] rounded-lg p-6 border border-[#2D2F32]">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="User ID (3-20 characters)"
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
                maxLength={20}
              />
              <div className="h-6"></div>

              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  className="
    w-full py-4 px-5 pr-8 text-white bg-[#2D2F32]
    rounded-xl text-center text-lg placeholder:text-center placeholder:text-lg placeholder-gray-400
    outline-none border-none
    transition duration-300 ease-in-out
    focus:shadow-[0_0_15px_rgba(34,178,5,0.4)]
    focus:bg-[#2D2F32]
                  "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={32}
                  onFocus={() => setShowPasswordRequirements(true)}
                  onBlur={() => setShowPasswordRequirements(false)}
                />
                {/* Updated Password Requirements Popup */}
                {showPasswordRequirements && (
                  <div className="absolute z-[100] left-full ml-6 top-1/2 transform -translate-y-1/2 w-64">
                    <div className="relative p-4 rounded-lg">
                      <h3 className="text-[#22B205] font-medium mb-3 text-center">
                        Password Requirements
                      </h3>
                      <ul className="text-gray-300 text-sm space-y-2 flex flex-col items-center">
                        <li
                          className={`flex items-center ${
                            password.length >= 8 ? "text-[#22B205]" : ""
                          }`}
                        >
                          <span className="mr-2">
                            {password.length >= 8 ? "✓" : "•"}
                          </span>
                          Min 8 characters
                        </li>
                        <li
                          className={`flex items-center ${
                            /[A-Z]/.test(password) ? "text-[#22B205]" : ""
                          }`}
                        >
                          <span className="mr-2">
                            {/[A-Z]/.test(password) ? "✓" : "•"}
                          </span>
                          Uppercase letter
                        </li>
                        <li
                          className={`flex items-center ${
                            /[a-z]/.test(password) ? "text-[#22B205]" : ""
                          }`}
                        >
                          <span className="mr-2">
                            {/[a-z]/.test(password) ? "✓" : "•"}
                          </span>
                          Lowercase letter
                        </li>
                        <li
                          className={`flex items-center ${
                            /[0-9]/.test(password) ? "text-[#22B205]" : ""
                          }`}
                        >
                          <span className="mr-2">
                            {/[0-9]/.test(password) ? "✓" : "•"}
                          </span>
                          Number
                        </li>
                        <li
                          className={`flex items-center ${
                            /[!@#$%^&*(),.?":{}|<>]/.test(password)
                              ? "text-[#22B205]"
                              : ""
                          }`}
                        >
                          <span className="mr-2">
                            {/[!@#$%^&*(),.?":{}|<>]/.test(password)
                              ? "✓"
                              : "•"}
                          </span>
                          Special character
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-6"></div>
              <input
                type="password"
                placeholder="Confirm Password"
                className="
                  w-full py-4 px-5 text-white bg-[#2D2F32]
                  rounded-xl text-center text-lg placeholder:text-center placeholder:text-lg placeholder-gray-400
                  outline-none border-none
                  transition duration-300 ease-in-out
                  focus:shadow-[0_0_15px_rgba(34,178,5,0.4)]
                  focus:bg-[#2D2F32]
                "
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                maxLength={32}
              />
              <div className="h-6"></div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
            </div>

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
                  boxShadow: "0 0 15px rgba(34,178,5,0.4)",
                },
                py: 2.5,
              }}
            >
              Register
            </GreenButton>
            <div className="h-6"></div>

            <div className="flex items-center justify-center space-x-2 pt-4">
              <span className="text-gray-400 text-sm">
                Already have an account?
              </span>
              <Link
                href="/login"
                className="text-[#22B205] hover:underline text-sm"
              >
                &nbsp;Log In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
