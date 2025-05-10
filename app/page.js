"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Wrap the redirect in a small timeout to ensure proper hydration
    const timeout = setTimeout(() => {
      router.push("/newDoc");
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [router]);

  // Provide a minimal loading state while redirect happens
  return <div className="min-h-screen" />;
}