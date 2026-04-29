"use client";

import { useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useAuth } from "@/context/auth-context";
import { LogOut, Users, Shield, RefreshCcw, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { ThemeToggle } from "@/components/theme-toggle";

const fetchUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export default function Home() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const router = useRouter();

  const { data: users, error, isLoading: isDataLoading, refetch, isFetching } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: !!user && user.role === 'ADMIN',
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const summary = useMemo(
    () => ({
      count: users?.length ?? 0,
      message: isDataLoading
        ? "Loading users..."
        : error
          ? "Unable to load users"
          : "System in sync",
    }),
    [users, isDataLoading, error],
  );

  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-500">Authenticating...</div>;
  if (!user || user.role !== 'ADMIN') return null;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="border-b dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-red-600 rounded flex items-center justify-center text-white">
              <Shield size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Allids Admin <span className="text-xs font-normal text-zinc-500 ml-2">v1.0</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{user.username}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-tighter">System Administrator</p>
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout} className="text-zinc-500 hover:text-red-600">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl w-full px-6 py-8 flex flex-col gap-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Users</p>
              <Users className="text-zinc-400" size={20} />
            </div>
            <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              {summary.count}
            </div>
            <p className="text-sm text-zinc-500 mt-2">
              {summary.message}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">API Status</p>
              <RefreshCcw className={`text-zinc-400 ${isFetching ? 'animate-spin' : ''}`} size={20} />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={error ? "destructive" : "default"}>
                {isDataLoading ? "Syncing" : error ? "Error" : "Healthy"}
              </Badge>
              <span className="text-sm text-zinc-500">
                {error ? "Check connection" : "Vitals stable"}
              </span>
            </div>
            <p className="text-sm text-zinc-500 mt-5">
              Response time: 24ms (Avg)
            </p>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? <Loader2 className="animate-spin mr-2" size={14} /> : <RefreshCcw className="mr-2" size={14} />}
                Reload Data
              </Button>
              <Button size="sm" className="bg-zinc-800">
                Generate Report
              </Button>
            </div>
          </Card>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              User Directory
            </h2>
            <Badge variant="outline" className="font-mono">{summary.count} ENTRIES</Badge>
          </div>

          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30">
                    <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Identity</th>
                    <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Status</th>
                    <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Verified At</th>
                    <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-zinc-800">
                  {isDataLoading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                        <Loader2 className="animate-spin mx-auto mb-2" />
                        Fetching user records...
                      </td>
                    </tr>
                  )}
                  {users?.map((userEntry: any) => (
                    <tr key={userEntry.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-50">{userEntry.id.substring(0, 8)}...</p>
                          <p className="text-xs text-zinc-500">{userEntry.phone || userEntry.username}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={userEntry.status === 'VERIFIED' ? 'default' : 'secondary'}
                          className={userEntry.status === 'VERIFIED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                        >
                          {userEntry.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {new Date(userEntry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 text-blue-600">View</Button>
                        <Button variant="ghost" size="sm" className="h-8 text-red-600 ml-2">Suspend</Button>
                      </td>
                    </tr>
                  ))}
                  {!isDataLoading && users?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                        No user records found in the system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
