"use client";

import Link from "next/link";
import { Home, User, Plus, Users, MessageCircle, Trophy } from "lucide-react";
import Image from "next/image";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

// Custom green Button style with white text
const GreenButton = styled(Button)(({ theme }) => ({
  color: "white", // White text
  borderColor: "#22B205",
  "&:hover": {
    backgroundColor: "rgba(34, 178, 5, 0.08)",
    borderColor: "#22B205",
    transform: "translateY(-2px)", // Pop-out effect on hover
    boxShadow: "0 4px 20px rgba(34, 178, 5, 0.2)", // Green mist shadow
  },
  "&:active": {
    transform: "translateY(0px)", // Neutralize the pop effect on click
  },
}));

export default function Sidebar() {
  return (
    <aside className="flex flex-col w-52 h-screen bg-[#0E1113] py-4 px-4 border-r border-gray-600 text-white relative">
      <div className="flex flex-col items-center w-full">
        <div style={{ height: "6px" }} />
        {/* Logo */}
        <Link
          href="/"
          className="mt-4 mb-6 transition-transform duration-200 hover:scale-105"
        >
          <Image src="/LPORTLOGO.png" width={130} height={130} alt="Logo" />
        </Link>
        <div style={{ height: "7px" }} />
        {/* Vertical Line Spanning Full Height */}
        <div className="w-full h-px bg-gray-500 opacity-40" />
        {/* ← horizontal line */}
        <div className="absolute right-0 top-0 h-screen w-px bg-gray-500 opacity-40 z-10" />
        <div style={{ height: "15px" }} />
        {/* Nav Buttons */}
        <div className="flex flex-col items-center gap-y-2 mt-8 w-full px-2">
          <SidebarButton
            href="/"
            icon={<Home className="w-5 h-5" />}
            label="Home"
          />
          <SidebarButton
            href="/create"
            icon={<Plus className="w-5 h-5" />}
            label="New Post"
          />
          <SidebarButton
            href="/communities"
            icon={<Users className="w-5 h-5" />}
            label="Communities"
          />
          <SidebarButton
            href="/announcements"
            icon={<MessageCircle className="w-5 h-5" />}
            label="Announcements"
          />
          <SidebarButton
            href="/leaderboard"
            icon={<Trophy className="w-5 h-5" />}
            label="Leaderboard"
          />
          <SidebarButton
            href="/profile"
            icon={<User className="w-5 h-5" />}
            label="Profile"
          />
        </div>
      </div>
    </aside>
  );
}

function SidebarButton({ href, icon, label }) {
  const buttonContent = (
    <GreenButton
      fullWidth
      startIcon={icon}
      sx={{
        justifyContent: "flex-start",
        py: 1.25, // Slightly smaller padding for button height
        textTransform: "none",
        fontSize: "0.875rem", // Slightly smaller font size
        fontWeight: "light",
        "& .MuiButton-startIcon": {
          color: "#22B205", // Green icon color
        },
      }}
    >
      {label}
    </GreenButton>
  );

  return href ? (
    <Link href={href} passHref>
      {buttonContent}
    </Link>
  ) : (
    buttonContent
  );
}
