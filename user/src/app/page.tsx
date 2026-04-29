"use client";

import Link from "next/link";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === 'USER') router.push('/dashboard/user');
      else if (user.role === 'ORG') router.push('/dashboard/org');
    }
  }, [user, router]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome to <span className="text-blue-600">Allids</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Your secure digital identity wallet. Manage, verify, and share your documents with ease and privacy.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center md:grid-cols-1 gap-8 mt-12">
          <Card className="p-8 w-96 flex flex-col items-center space-y-6 hover:shadow-xl transition-shadow bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Personal User</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                Securely store your ID, passport, or driver's license. Share verified details with organizations.
              </p>
            </div>
            <Button asChild className="w-full h-12 text-lg">
              <Link href="/auth/user/login">Sign In</Link>
            </Button>
          </Card>

          <Card className="hidden p-8 flex flex-col items-center space-y-6 hover:shadow-xl transition-shadow bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
            <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <span className="text-3xl">🏢</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Organization</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                Request verified identity information and documents from your customers or employees.
              </p>
            </div>
            <div className="flex flex-col w-full gap-3">
              <Button asChild className="w-full h-12 text-lg">
                <Link href="/auth/org/login">Org Login</Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-12 text-lg">
                <Link href="/auth/org/register">Apply for Account</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
