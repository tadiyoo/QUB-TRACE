"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileClient from "./ProfileClient";

type User = {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  school: string | null;
  department: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-trace-stone">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ProfileClient
      user={{
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        school: user.school,
        department: user.department,
      }}
    />
  );
}
