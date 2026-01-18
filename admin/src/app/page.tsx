"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const fetchUsers = async () => {
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) {
    throw new Error("Unable to load user list");
  }
  return response.json();
};

export default function Home() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    refetchOnWindowFocus: false,
  });

  const summary = useMemo(
    () => ({
      count: data?.length ?? 0,
      message: isLoading
        ? "Loading users..."
        : error
        ? "Unable to load users"
        : "User data synced with the API",
    }),
    [data, isLoading, error],
  );

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
            Admin Portal
          </p>
          <h1 className="text-4xl font-semibold text-zinc-900 dark:text-zinc-50">
            Users{" "}
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-300">
              / live sync
            </span>
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300">
            Powered by TanStack Query and the Nest API.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card title="Users">
            <div className="mb-4 text-5xl font-bold text-zinc-900 dark:text-zinc-50">
              {summary.count}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {summary.message}
            </p>
          </Card>

          <Card title="Status">
            <div className="flex items-center gap-2">
              <Badge variant={error ? "danger" : "default"}>
                {isLoading ? "syncing" : error ? "stale" : "online"}
              </Badge>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {error ? "Check API" : "API healthy"}
              </span>
            </div>
          </Card>

          <Card title="Actions">
            <Button variant="ghost" onClick={() => refetch()}>
              Refresh users
            </Button>
          </Card>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Latest accounts
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {isLoading && (
              <Card className="bg-zinc-100/60 dark:bg-zinc-900/70">
                <p className="text-sm text-zinc-600">
                  Loading users from the API...
                </p>
              </Card>
            )}
            {error && (
              <Card className="bg-red-50 text-red-700">
                <p className="text-sm">
                  There was a problem loading users. Try refreshing the stack or
                  checking the API.
                </p>
              </Card>
            )}
            {data?.map((user: { id: number; name: string; email: string }) => (
              <Card key={user.id} className="border-zinc-200 dark:border-zinc-800">
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  {user.id}
                </p>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {user.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {user.email}
                </p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
