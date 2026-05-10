"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Wallet, 
    ShieldCheck, 
    History, 
    Bell, 
    Settings, 
    LogOut,
    ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard/user" },
    { name: "Wallet", icon: Wallet, href: "/dashboard/user/wallet" },
    { name: "Verification", icon: ShieldCheck, href: "/dashboard/user/verification" },
    { name: "Access Requests", icon: History, href: "/dashboard/user/access" },
    { name: "Notifications", icon: Bell, href: "/dashboard/user/notifications" },
    { name: "Settings", icon: Settings, href: "/dashboard/user/settings" },
];

export function UserSidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    return (
        <aside className="w-64 border-r bg-white dark:bg-zinc-950 flex flex-col h-screen sticky top-0">
            {/* Header / Logo */}
            <div className="p-6 border-b">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-lg tracking-tighter leading-none">ALLIDS</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">User Portal</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-4 mt-2">
                    Menu
                </div>
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.name} 
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group",
                                isActive 
                                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold" 
                                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-50"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} className={cn(
                                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 group-hover:text-zinc-600"
                                )} />
                                <span className="text-sm">{item.name}</span>
                            </div>
                            {isActive && <ChevronRight size={14} className="opacity-50" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Summary */}
            <div className="p-4 border-t space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase">
                        {user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-bold truncate">{user?.name || "User"}</span>
                        <span className="text-[10px] text-zinc-500 truncate">{user?.phone}</span>
                    </div>
                </div>

                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 h-10 px-3 gap-3 rounded-xl transition-all"
                    onClick={logout}
                >
                    <LogOut size={20} />
                    <span className="text-sm font-bold">Logout System</span>
                </Button>
            </div>
        </aside>
    );
}
