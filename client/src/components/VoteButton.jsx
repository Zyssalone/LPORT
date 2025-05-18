"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function VoteButton({
  type = "upvote",
  count = 0,
  active = false,
  disabled = false,
  onClick = () => {},
}) {
  
  const Icon = type === "upvote" ? ThumbsUp : ThumbsDown;

  const baseClasses =
    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition duration-200";
  const defaultStyle = "bg-white/10 text-white hover:bg-[#22B205]/20 hover:text-[#22B205]";
  const activeStyle = "bg-[#22B205]/30 text-[#22B205]";
  const disabledStyle = "opacity-50 cursor-not-allowed";

  const className = [
    baseClasses,
    active ? activeStyle : defaultStyle,
    disabled ? disabledStyle : "",
  ]
    .join(" ")
    .trim();

  return (
    <button onClick={onClick} disabled={disabled} className={className}>
      <Icon className="w-5 h-5 stroke-current" /> {/* Added stroke-current */}
      {count}
    </button>
  );
}