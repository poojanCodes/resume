"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * useAuth — custom hook for client-side authentication guard.
 *
 * Lesson: This is one of the most important patterns in React.
 * Instead of writing the same "if not logged in, redirect" logic
 * on every protected page, we extract it into a reusable hook.
 *
 * How it works:
 * 1. Reads user info from localStorage (stored at login time)
 * 2. If no user found → redirects to /auth/login immediately
 * 3. Returns { user, loading } so the page can show a spinner
 *    while it determines auth state
 *
 * NOTE: This is a CLIENT-SIDE check only. The real security comes
 * from the HTTP-only JWT cookie that your backend validates on every
 * API request. This hook is just for UX (avoid showing the page flash).
 */

interface StoredUser {
  name:  string;
  email: string;
  id?:   string;
}

interface UseAuthReturn {
  user:    StoredUser | null;
  loading: boolean;
}

export function useAuth(): UseAuthReturn {
  const router  = useRouter();
  const [user, setUser]       = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("user");

    if (!raw) {
      // No local record → send to login
      router.replace("/auth/login");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredUser;
      setUser(parsed);
    } catch {
      // Corrupted data → clear and redirect
      localStorage.removeItem("user");
      router.replace("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { user, loading };
}
