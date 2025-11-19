import { User } from "@shared/schema";
import { useState, useEffect } from "react";
import { apiRequest } from "./queryClient";

let currentUser: User | null = null;
let userLoadPromise: Promise<User | null> | null = null;

export async function fetchCurrentUser(): Promise<User | null> {
  if (userLoadPromise) {
    return userLoadPromise;
  }

  userLoadPromise = (async () => {
    try {
      const response = await apiRequest("GET", "/api/auth/me", {});
      const data = await response.json();
      currentUser = data.user;
      return currentUser;
    } catch (error) {
      currentUser = null;
      return null;
    } finally {
      userLoadPromise = null;
    }
  })();

  return userLoadPromise;
}

export function getStoredUser(): User | null {
  return currentUser;
}

export function setStoredUser(user: User | null) {
  currentUser = user;
}

export async function logout() {
  try {
    await apiRequest("POST", "/api/auth/logout", {});
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    currentUser = null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}

export function isIndustry(user: User | null): boolean {
  return user?.role === "industry";
}

export function isUser(user: User | null): boolean {
  return user?.role === "user";
}
