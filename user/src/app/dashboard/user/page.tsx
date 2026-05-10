"use client";

import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ShieldCheck,
    ArrowUpRight,
    Plus,
    Activity,
    Lock,
    Eye,
    Clock,
    CheckCircle2,
    AlertCircle,
    FileText,
    ChevronRight,
    Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
    const { user } = useAuth();
    const router = useRouter();

    // Fetch stats for overview
    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const [docsRes, walletRes, historyRes] = await Promise.all([
                api.get("/documents"),
                api.get("/documents/wallet"),
                api.get("/verification/history") // Assuming this exists or returns similar
            ]);
            return {
                totalDocs: docsRes.data.length,
                verifiedDocs: walletRes.data.length,
                pendingDocs: docsRes.data.filter((d: any) => d.status === 'PENDING').length,
                recentHistory: historyRes.data?.slice(0, 5) || []
            };
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Overview</h1>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">Welcome back, {user?.name}. Your identity cloud is active.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-5 rounded-xl border-slate-200 dark:border-zinc-800 gap-2 font-bold" asChild>
                        <Link href="/dashboard/user/history">
                            <Activity size={18} className="text-indigo-600" />
                            System Logs
                        </Link>
                    </Button>
                    <Button className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 gap-2 font-bold transition-all active:scale-95" asChild>
                        <Link href="/dashboard/user/upload">
                            <Plus size={18} />
                            Register ID
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <ShieldCheck size={20} />
                        </div>
                        <Badge className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-0 font-black text-[10px]">TRUST SCORE</Badge>
                    </div>
                    <div>
                        <p className="text-3xl font-black tracking-tighter">980</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Excellent Standing</p>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 w-[92%] rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                    </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="h-10 w-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                            <Zap size={20} />
                        </div>
                        <Badge className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-0 font-black text-[10px]">VERIFIED ASSETS</Badge>
                    </div>
                    <div>
                        <p className="text-3xl font-black tracking-tighter">{stats?.verifiedDocs || 0}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Active Wallet Items</p>
                    </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="h-10 w-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Clock size={20} />
                        </div>
                        <Badge className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-0 font-black text-[10px]">PENDING ACTIONS</Badge>
                    </div>
                    <div>
                        <p className="text-3xl font-black tracking-tighter">{stats?.pendingDocs || 0}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Requiring Attention</p>
                    </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Eye size={20} />
                        </div>
                        <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-0 font-black text-[10px]">ACTIVE GRANTS</Badge>
                    </div>
                    <div>
                        <p className="text-3xl font-black tracking-tighter">04</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized Org Access</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Activity & Wallet */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Feed */}
                    <Card className="bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-zinc-800 flex items-center justify-between">
                            <h3 className="font-black text-lg tracking-tight uppercase text-slate-900 dark:text-white">Recent Activity</h3>
                            <Button variant="ghost" size="sm" className="text-indigo-600 font-bold" asChild>
                                <Link href="/dashboard/user/history">View Full Audit</Link>
                            </Button>
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-zinc-800">
                            {stats?.recentHistory.length > 0 ? (
                                stats.recentHistory.map((item: any, i: number) => (
                                    <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                                <Activity size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-white">Request approved for {item.orgName || "Bank HQ"}</p>
                                                <p className="text-xs text-slate-400 font-medium">{new Date(item.createdAt).toLocaleDateString()} • {item.purpose}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center space-y-4">
                                    <div className="h-16 w-16 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-slate-300 mx-auto">
                                        <FileText size={32} />
                                    </div>
                                    <p className="text-slate-400 font-bold">No recent activities logged.</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Quick Document Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <Card className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/20 relative overflow-hidden group">
                            <Plus className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                            <div className="relative z-10 space-y-4">
                                <h4 className="text-lg font-black leading-tight">Expansion <br /> Required?</h4>
                                <p className="text-indigo-100/80 text-xs font-medium leading-relaxed">Add a National ID or Passport to unlock high-tier banking permissions.</p>
                                <Button className="bg-white text-indigo-600 hover:bg-indigo-50 font-black rounded-xl h-9 px-4" asChild>
                                    <Link href="/dashboard/user/upload">Launch Uploader</Link>
                                </Button>
                            </div>
                         </Card>
                         
                         <Card className="p-6 bg-slate-900 text-white border-0 shadow-xl relative overflow-hidden group">
                            <Lock className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                            <div className="relative z-10 space-y-4">
                                <h4 className="text-lg font-black leading-tight">Security <br /> Governance</h4>
                                <p className="text-zinc-400 text-xs font-medium leading-relaxed">Your account is secured with biometric-linked private keys. MFA is enabled.</p>
                                <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 font-black rounded-xl h-9 px-4" asChild>
                                    <Link href="/dashboard/user/settings">Security Hub</Link>
                                </Button>
                            </div>
                         </Card>
                    </div>
                </div>

                {/* Right Column: Security & Insights */}
                <div className="space-y-8">
                    <Card className="p-8 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="space-y-1">
                            <h3 className="font-black text-lg tracking-tight uppercase">System Health</h3>
                            <p className="text-xs text-slate-500 font-medium tracking-tight">Identity integrity verification</p>
                        </div>

                        <div className="space-y-6">
                             <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Encryption Level</span>
                                    <span className="text-indigo-600">AES-256</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full">
                                    <div className="h-full bg-indigo-600 w-full rounded-full" />
                                </div>
                             </div>

                             <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Network Latency</span>
                                    <span className="text-green-600">12ms</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full">
                                    <div className="h-full bg-green-500 w-[95%] rounded-full" />
                                </div>
                             </div>

                             <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Sync Status</span>
                                    <span className="text-blue-600">Cloud Syncing</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full">
                                    <div className="h-full bg-blue-500 w-[80%] rounded-full animate-pulse" />
                                </div>
                             </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50 dark:border-zinc-800">
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                <ShieldCheck size={16} className="text-indigo-600" />
                                <span>Verified by Regula AI</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Zap size={20} />
                        </div>
                        <h4 className="font-black text-sm uppercase tracking-tight">Identity Discovery</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Linking your tax ID can improve your credit trust level across the ALLIDS network.
                        </p>
                        <Button variant="ghost" className="w-full justify-between text-indigo-600 font-bold p-0 group">
                            <span>Link Tax Identity</span>
                            <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}

