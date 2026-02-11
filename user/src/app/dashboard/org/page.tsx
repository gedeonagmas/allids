"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
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

export default function OrgDashboard() {
    const { user, isLoading: isAuthLoading, logout } = useAuth();
    const router = useRouter();
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [isOneTimeModalOpen, setIsOneTimeModalOpen] = useState(false);
    const [activeGrantId, setActiveGrantId] = useState<string | null>(null);

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

            if (data.title && data.message) {
                toast.info(data.title, {
                    description: data.message,
                });
            }

            // If it's a one-time image approval, pop it up!
            if (data.payload?.grantId && data.payload?.accessType === 'FULL_DOCUMENT') {
                setActiveGrantId(data.payload.grantId);
                setIsOneTimeModalOpen(true);
            }

            refetchHistory();
        };

        socket.on('verification_approved', handleVerificationUpdate);
        socket.on('verification_denied', handleVerificationUpdate);
        socket.on('verification_request_replied', handleVerificationUpdate);

        return () => {
            socket.off('verification_approved', handleVerificationUpdate);
            socket.off('verification_denied', handleVerificationUpdate);
            socket.off('verification_request_replied', handleVerificationUpdate);
        };
    }, [socket, user, refetchHistory]);

    if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center">Loading institution...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
            {/* Sidebar/TopNav mix */}
            <nav className="border-b bg-white dark:bg-zinc-900 sticky top-0 z-20 shadow-sm border-blue-100 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white">
                            <Building2 size={18} />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Allids <span className="text-blue-600">Enterprise</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="hidden sm:flex">
                            <Search size={18} className="text-zinc-500 mr-2" />
                            <span className="text-zinc-500">Quick Search</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={logout} className="text-zinc-500 hover:text-red-600 transition-colors">
                            <LogOut size={18} />
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto w-full px-6 py-10 flex flex-col gap-8">
                {/* Header Summary */}
                <section className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-blue-500/30 text-blue-50 border-blue-400/30 hover:bg-blue-500/40">Verified Institution</Badge>
                                <span className="text-blue-200 text-sm">{profile?.organizationType || "Business"}</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight">{profile?.name || "Organization Dashboard"}</h1>
                            <p className="text-blue-100 max-w-xl text-lg opacity-90">
                                Institutional access to verified digital identities. Manage verification requests and audit logs.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <Button
                                className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-6 h-12 shadow-xl"
                                onClick={() => setIsVerifyModalOpen(true)}
                            >
                                New Verify Request
                            </Button>
                            <Button variant="outline" className="border-blue-400 text-white hover:bg-blue-700 font-bold px-6 h-12">
                                API Explorer
                            </Button>
                        </div>
                    </div>
                    {/* Decorative Circle */}
                    <div className="absolute top-0 right-0 h-64 w-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 h-48 w-48 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />
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
                    <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow transition-all group hover:border-blue-500/30">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">KYC Verified</p>
                            <ShieldCheck size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-3xl font-black">{history?.filter((r: any) => r.status === 'APPROVED' && r.accessType === 'FIELDS_ONLY').length || 0}</p>
                        <div className="flex items-center gap-1 mt-2 text-zinc-400 text-xs">
                            <span>Reusable records</span>
                        </div>
                    </Card>

                    <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow transition-all group hover:border-zinc-500/30">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">One-Time Access</p>
                            <Clock size={16} className="text-zinc-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-3xl font-black">{history?.filter((r: any) => r.status === 'APPROVED' && r.accessType === 'FULL_DOCUMENT').length || 0}</p>
                        <div className="flex items-center gap-1 mt-2 text-zinc-400 text-xs">
                            <span>Session access logs</span>
                        </div>
                    </Card>

                    <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow transition-all group hover:border-green-500/30">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Success Rate</p>
                            <FileCheck2 size={16} className="text-green-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-3xl font-black">
                            {history && history.length > 0
                                ? `${Math.round((history.filter((r: any) => r.status === 'APPROVED').length / history.length) * 100)}%`
                                : "0%"}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-bold">
                            <ArrowUpRight size={12} />
                            <span>Active verifications</span>
                        </div>
                    </Card>

                    <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow transition-all group hover:border-blue-600/30">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">API Status</p>
                            <History size={16} className="text-zinc-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-3xl font-black text-blue-600">Online</p>
                        <p className="text-xs text-zinc-500 mt-2">v0.1.0 Institutional</p>
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
                                    <Card key={item.id} className="p-4 border-zinc-200 dark:border-zinc-800 flex items-center justify-between hover:border-blue-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center",
                                                item.status === 'APPROVED' ? "bg-green-100 text-green-600" :
                                                    item.status === 'REJECTED' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                                            )}>
                                                {item.status === 'APPROVED' ? <UserCheck size={18} /> : <Clock size={18} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{item.user.phone}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 border-zinc-200 uppercase">
                                                        {item.accessType === 'FIELDS_ONLY' ? 'KYC Data' : 'One-Time Access'}
                                                    </Badge>
                                                    <p className="text-xs text-zinc-500">{item.accessPurpose}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <Badge variant={item.status === 'APPROVED' ? 'default' : item.status === 'PENDING' ? 'secondary' : 'destructive'} className="text-[10px]">
                                                    {item.status}
                                                </Badge>
                                                <p className="text-[10px] text-zinc-400 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            {item.status === 'APPROVED' && (
                                                <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => router.push(`/dashboard/org/verify/${item.permissionGrant.id}`)}>
                                                    View Data
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
                        <Card className="bg-zinc-900 border-0 p-6 text-white overflow-hidden relative shadow-xl">
                            <div className="relative z-10 space-y-4">
                                <h3 className="font-bold">Enterprise API Docs</h3>
                                <p className="text-sm text-zinc-400">Integrate Allids verification directly into your mobile app or website.</p>
                                <Button size="sm" className="bg-white text-zinc-900 hover:bg-zinc-200 gap-1 font-bold">
                                    Read Docs <ExternalLink size={14} />
                                </Button>
                            </div>
                            <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-blue-500/20 rounded-full blur-2xl" />
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
