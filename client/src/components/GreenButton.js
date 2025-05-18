"use client";

import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

// Custom GreenButton with the same style as Sidebar buttons
const GreenButton = styled(Button)(({ theme }) => ({
  color: "white", // White text
  borderColor: "#22B205", // Green border
  textTransform: "none", // Avoid uppercasing the text
  fontSize: "0.750rem", // Slightly smaller font size (like the sidebar buttons)
  fontWeight: "light", // Light font weight
  padding: "8px 16px", // Padding for consistent button size

  "&:hover": {
    backgroundColor: "rgba(34, 178, 5, 0.08)", // Green hover effect
    borderColor: "#22B205", // Keep the border green on hover
    transform: "translateY(-2px)", // Pop-out effect on hover
    boxShadow: "0 4px 20px rgba(34, 178, 5, 0.2)", // Green mist shadow
  },

  "&:active": {
    transform: "translateY(0px)", // Neutralize the pop effect on click
  },

  "& .MuiButton-startIcon": {
    color: "#22B205", // Green color for the icon
  },
}));

export default GreenButton;
