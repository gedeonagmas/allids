"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { UserSidebar } from "@/components/user-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export default function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    // Protected route check
    useEffect(() => {
        if (!isAuthLoading && (!user || user.role !== 'USER')) {
            router.push("/");
        }
    }, [user, isAuthLoading, router]);

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
                <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-500 animate-pulse">Syncing Identity Backbone...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#09090b]">
            <UserSidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Internal Dashboard Header */}
                <header className="h-16 border-b bg-white dark:bg-zinc-950 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Network Status:</span>
                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Operational</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="h-8 w-[1px] bg-zinc-100 dark:bg-zinc-800" />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black uppercase tracking-tight">{user.name}</p>
                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">ID: {user.id.slice(0, 8)}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[10px] font-black">
                                HQ
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-transparent">
                    <div className="max-w-6xl mx-auto space-y-8 pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
