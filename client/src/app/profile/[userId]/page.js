"use client";

import { useState, useEffect } from "react";
import ProfileClient from "./ProfileClient"; // Correct relative import path

// Fix for dynamic route: Use async function for dynamic params in Next.js 13
export default async function ProfilePage({ params }) {
  // Use await here to properly get dynamic params
  const { userId } = await params;

  console.log("Requested user ID:", userId); // confirm value

  return <ProfileClient userId={userId} />;
}