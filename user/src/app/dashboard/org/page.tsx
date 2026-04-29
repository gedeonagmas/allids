"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerifyRequestModal } from "@/components/verify-request-modal";
import { OneTimeImageModal } from "@/components/one-time-image-modal";
import { useSocket } from "@/context/socket-context";
import {
    Building2,
    Users,
    FileCheck2,
    Settings,
    LogOut,
    ArrowUpRight,
    ExternalLink,
    ShieldCheck,
    History,
    Search,
    Clock,
    UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

export default function OrgDashboard() {
    const { user, isLoading: isAuthLoading, logout } = useAuth();
    const router = useRouter();
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [isOneTimeModalOpen, setIsOneTimeModalOpen] = useState(false);
    const [activeGrantId, setActiveGrantId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isAuthLoading && (!user || user.role !== 'ORG')) {
            router.push("/");
        }
    }, [user, isAuthLoading, router]);

    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ["org-profile"],
        queryFn: async () => {
            const res = await api.get("/users/profile");
            return res.data;
        },
        enabled: !!user && user.role === 'ORG',
    });

    const { data: history, isPending: isHistoryLoading, refetch: refetchHistory } = useQuery({
        queryKey: ["verification-history"],
        queryFn: async () => {
            const res = await api.get("/verification/history");
            return res.data;
        },
        enabled: !!user && user.role === 'ORG',
    });

    // Set up real-time listener for verification updates
    const { socket } = useSocket();
    useEffect(() => {
        if (!socket || !user || user.role !== 'ORG') return;

        const handleVerificationUpdate = (data: any) => {
            console.log('Real-time verification update:', data);

            // Handle prominent notification for Revocation
            if (data.event === 'grant_revoked' || data.title?.includes('Revoked')) {
                toast.error(data.title || "Access Revoked", {
                    description: data.message || "A user has revoked your access to their data.",
                    duration: 10000, // Keep visible longer
                });
            } else if (data.title && data.message) {
                toast.info(data.title, {
                    description: data.message,
                });
            }

            // If it's a one-time image approval, pop it up!
            if (data.payload?.grantId && data.payload?.accessType === 'FULL_DOCUMENT') {
                setActiveGrantId(data.payload.grantId);
                setIsOneTimeModalOpen(true);
            }

            // Hard invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ["verification-history"] });
            refetchHistory();
        };

        socket.on('verification_approved', handleVerificationUpdate);
        socket.on('verification_denied', handleVerificationUpdate);
        socket.on('verification_request_replied', handleVerificationUpdate);
        socket.on('grant_revoked', handleVerificationUpdate);

        return () => {
            socket.off('verification_approved', handleVerificationUpdate);
            socket.off('verification_denied', handleVerificationUpdate);
            socket.off('verification_request_replied', handleVerificationUpdate);
            socket.off('grant_revoked', handleVerificationUpdate);
        };
    }, [socket, user, refetchHistory]);

    if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center">Loading institution...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col font-sans">
            {/* Sidebar/TopNav mix */}
            <nav className="border-b bg-white dark:bg-zinc-900 sticky top-0 z-20 shadow-sm border-indigo-100 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <Building2 size={22} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Global Trust</span>
                            <span className="text-[10px] font-bold text-indigo-600 tracking-[0.2em] uppercase">Institutional Console</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-full border border-slate-200 dark:border-zinc-700">
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Network Secure</span>
                        </div>
                        <ThemeToggle />
                        <Button variant="ghost" size="sm" onClick={logout} className="text-slate-400 hover:text-red-600 transition-colors">
                            <LogOut size={20} />
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto w-full px-6 py-6 flex flex-col gap-6">
                {/* Header Summary - Minimalistic High-Density Theme */}
                <section className="bg-white dark:bg-zinc-900 rounded-3xl p-8 relative overflow-hidden shadow-sm border border-slate-100 dark:border-zinc-800">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
                                <Building2 size={28} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                        {profile?.name || "Corporate Dashboard"}
                                    </h1>
                                    <Badge className="bg-green-50 text-green-700 border-green-100 hover:bg-green-100 text-[10px] px-2 py-0">Active</Badge>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-zinc-400 font-medium">
                                    <span className="uppercase tracking-widest text-[10px] font-black text-indigo-600">{profile?.organizationType || "Banking"}</span>
                                    <span className="h-1 w-1 bg-slate-300 rounded-full" />
                                    <span>Institutional Identity Management</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                size="sm"
                                className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-5 h-10 rounded-xl"
                                onClick={() => setIsVerifyModalOpen(true)}
                            >
                                <ShieldCheck className="mr-2" size={16} />
                                Initiate Audit
                            </Button>
                            <Button variant="outline" size="sm" className="border-slate-200 dark:border-zinc-800 font-bold px-5 h-10 rounded-xl shadow-sm">
                                View Logs
                            </Button>
                        </div>
                    </div>
                </section>

                <VerifyRequestModal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} />

                <OneTimeImageModal
                    grantId={activeGrantId}
                    isOpen={isOneTimeModalOpen}
                    onClose={() => {
                        setIsOneTimeModalOpen(false);
                        setActiveGrantId(null);
                    }}
                />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow transition-all group hover:border-indigo-500/30">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Compliance Checks</p>
                            <ShieldCheck size={16} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-3xl font-black">{history?.filter((r: any) => r.status === 'APPROVED' && r.accessType === 'FIELDS_ONLY').length || 0}</p>
                        <div className="flex items-center gap-1 mt-2 text-zinc-400 text-xs font-medium">
                            <span>Audited records</span>
                        </div>
                    </Card>

                    <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow transition-all group hover:border-zinc-500/30">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Document Access</p>
                            <Clock size={16} className="text-zinc-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-3xl font-black">{history?.filter((r: any) => r.status === 'APPROVED' && r.accessType === 'FULL_DOCUMENT').length || 0}</p>
                        <div className="flex items-center gap-1 mt-2 text-zinc-400 text-xs font-medium">
                            <span>Secured sessions</span>
                        </div>
                    </Card>

                    <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow transition-all group hover:border-green-500/30">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Efficiency</p>
                            <FileCheck2 size={16} className="text-green-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-3xl font-black">
                            {history && history.length > 0
                                ? `${Math.round((history.filter((r: any) => r.status === 'APPROVED').length / history.length) * 100)}%`
                                : "0%"}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-black">
                            <ArrowUpRight size={12} />
                            <span>System throughput</span>
                        </div>
                    </Card>

                    <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow transition-all group hover:border-indigo-600/30">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Network Status</p>
                            <History size={16} className="text-zinc-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-3xl font-black text-indigo-600">Active</p>
                        <p className="text-xs text-zinc-500 mt-2 font-mono">v4.2.0 Institutional</p>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <History size={20} className="text-zinc-400" />
                                Recent Activity
                            </h2>
                            <Button variant="ghost" size="sm" className="text-blue-600 font-bold">Refresh</Button>
                        </div>

                        <div className="space-y-3">
                            {history && history.length > 0 ? (
                                history.map((item: any) => (
                                    <Card key={item.id} className="p-4 border-zinc-200 dark:border-zinc-800 flex items-center justify-between hover:border-indigo-200 transition-colors shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-12 w-12 rounded-xl flex items-center justify-center",
                                                item.status === 'APPROVED' ? "bg-green-100 text-green-600" :
                                                    item.status === 'REJECTED' ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-600"
                                            )}>
                                                {item.status === 'APPROVED' ? <UserCheck size={20} /> : <Clock size={20} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 dark:text-zinc-200">{item.user.phone}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="outline" className="text-[9px] font-black px-1.5 py-0 border-slate-200 uppercase tracking-tighter">
                                                        {item.accessType === 'FIELDS_ONLY' ? 'Data Extract' : 'Full Auth'}
                                                    </Badge>
                                                    <p className="text-xs text-zinc-500 font-medium">{item.accessPurpose}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                {item.permissionGrant?.status === 'REVOKED' ? (
                                                    <Badge variant="destructive" className="text-[10px] rounded-sm font-bold uppercase">
                                                        REVOKED
                                                    </Badge>
                                                ) : (
                                                    <Badge variant={item.status === 'APPROVED' ? 'default' : item.status === 'PENDING' ? 'secondary' : 'destructive'} className="text-[10px] rounded-sm font-bold uppercase">
                                                        {item.status}
                                                    </Badge>
                                                )}
                                                <p className="text-[10px] text-zinc-400 mt-1 font-mono">{new Date(item.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            {item.status === 'APPROVED' && item.permissionGrant?.status !== 'REVOKED' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="text-indigo-600 hover:bg-indigo-50 font-bold" 
                                                    onClick={() => {
                                                        if (item.permissionGrant?.id) {
                                                            router.push(`/dashboard/org/verify/${item.permissionGrant.id}`);
                                                        } else {
                                                            toast.error("Audit data record not found. Please refresh.");
                                                        }
                                                    }}
                                                >
                                                    Audit Data
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <Card className="border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-400 flex flex-col items-center justify-center gap-4 border-dashed bg-transparent">
                                    <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center">
                                        <History size={24} />
                                    </div>
                                    <p className="font-medium">No activity recorded yet for {profile?.name}.</p>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Organization Info */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Settings size={20} className="text-zinc-400" />
                                Business Profile
                            </h2>
                        </div>
                        <Card className="border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Handle</p>
                                <p className="font-mono text-sm bg-zinc-50 dark:bg-zinc-900 p-2 rounded border border-zinc-100 dark:border-zinc-800">
                                    @{user.username}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Headquarters</p>
                                <p className="text-sm">{profile?.address || "Not provided"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Contact Email</p>
                                <p className="text-sm text-blue-600">{profile?.contactEmail || "No contact email"}</p>
                            </div>
                            <Button className="w-full mt-4" variant="outline" onClick={() => router.push('/dashboard/org/settings')}>
                                Edit Profile
                            </Button>
                        </Card>

                        {/* Quick Links Card */}
                        <Card className="bg-slate-900 border-0 p-8 text-white overflow-hidden relative shadow-2xl rounded-3xl">
                            <div className="relative z-10 space-y-4">
                                <h3 className="font-black text-lg tracking-tight">Institutional API Gateway</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">Securely integrate verified identity data into your proprietary banking systems.</p>
                                <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-200 gap-1 font-black px-6">
                                    CORE API DOCS <ExternalLink size={14} />
                                </Button>
                            </div>
                            <div className="absolute -bottom-8 -right-8 h-32 w-32 bg-indigo-600/30 rounded-full blur-3xl" />
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
