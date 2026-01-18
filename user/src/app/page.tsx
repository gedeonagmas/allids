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

  const friendlyMessage = useMemo(
    () => ({
      message: isLoading
        ? "Warming up your feed..."
        : error
        ? "We can't reach the API right now."
        : "Data delivered via TanStack Query",
    }),
    [error, isLoading],
  );

  return (
    <main className="min-h-screen bg-white px-6 py-12 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
            User Dashboard
          </p>
          <h1 className="text-4xl font-semibold text-zinc-900 dark:text-zinc-50">
            Stay in sync with your team
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300">
            The UI consumes the same Nest API as the admin portal.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card title="Status">
            <div className="flex items-center gap-2">
              <Badge variant="default">{friendlyMessage.message}</Badge>
            </div>
          </Card>

          <Card title="Actions">
            <Button variant="ghost" onClick={() => refetch()}>
              Refresh feed
            </Button>
          </Card>

          <Card title="Members">
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {data?.length ?? "—"}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Profiles sourced from `api/users`
            </p>
          </Card>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Community snapshot
            </h2>
            {!isLoading && !error && <Badge variant="default">Live</Badge>}
          </div>
          {isLoading && (
            <Card className="bg-zinc-100/60 dark:bg-zinc-900/70">
              <p className="text-sm text-zinc-600">
                Hang tight while we fetch the latest members.
              </p>
            </Card>
          )}
          {error && (
            <Card className="bg-red-50 text-red-700">
              <p className="text-sm">
                Something went wrong with the API. Please try again shortly.
              </p>
            </Card>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {data?.map((user: { id: number; name: string; email: string }) => (
              <Card key={user.id} className="border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {user.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {user.email}
                </p>
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                  {user.id}
                </span>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
