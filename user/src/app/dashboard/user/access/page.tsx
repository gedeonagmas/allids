"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    History,
    ShieldX,
    Building2,
    Clock,
    ExternalLink,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Lock,
    Eye
} from "lucide-react";
import { toast } from "sonner";

export default function AccessRequestsPage() {
    const [activeTab, setActiveTab] = useState<"PENDING" | "ACTIVE" | "HISTORY">("PENDING");

    // Fetch pending requests
    const { data: requests, refetch: refetchRequests, isLoading: isRequestsLoading } = useQuery({
        queryKey: ["user-pending-requests"],
        queryFn: async () => {
            const res = await api.get("/verification/requests");
            return res.data;
        },
    });

    // Fetch history (grants)
    const { data: history, refetch: refetchHistory, isLoading: isHistoryLoading } = useQuery({
        queryKey: ["user-access-history"],
        queryFn: async () => {
            const res = await api.get("/verification/history");
            return res.data;
        },
    });

    const handleRevoke = async (grantId: string) => {
        if (!confirm("Are you sure you want to revoke this organization's access immediately?")) return;
        try {
            await api.post(`/verification/revoke/${grantId}`);
            toast.success("Access revoked successfully.");
            refetchHistory();
        } catch (error) {
            toast.error("Failed to revoke access.");
        }
    };

    const activeGrants = history?.filter((g: any) => g.status === 'ACTIVE') || [];
    const historicalGrants = history?.filter((g: any) => g.status !== 'ACTIVE') || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Access Governance</h1>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">Monitor and control institutional access to your identity data.</p>
                </div>
                <div className="flex p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl overflow-hidden">
                    {[
                        { id: "PENDING", label: "Requests", count: requests?.length || 0 },
                        { id: "ACTIVE", label: "Active", count: activeGrants.length },
                        { id: "HISTORY", label: "History", count: historicalGrants.length }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${
                                activeTab === tab.id 
                                ? "bg-white dark:bg-zinc-950 text-indigo-600 shadow-sm" 
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${
                                    activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-zinc-700 text-slate-600"
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pending Requests Tab */}
            {activeTab === "PENDING" && (
                <div className="space-y-6">
                    {isRequestsLoading ? (
                        [1, 2].map((i) => <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-zinc-900 animate-pulse" />)
                    ) : requests?.length > 0 ? (
                        requests.map((req: any) => (
                            <Card key={req.id} className="p-6 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm group">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex gap-5">
                                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 shrink-0">
                                            <Building2 size={28} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-lg tracking-tight uppercase">{req.organization.name}</h3>
                                                <Badge className="bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 font-bold text-[9px] px-2 uppercase tracking-widest">Awaiting Approval</Badge>
                                            </div>
                                            <p className="text-sm font-medium text-slate-500 max-w-xl">{req.accessPurpose}</p>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {req.requestedFields.map((field: string) => (
                                                    <span key={field} className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 dark:bg-zinc-800 text-slate-400 rounded-full border border-slate-100 dark:border-zinc-700 uppercase">
                                                        {field}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center items-end gap-3">
                                        <Button className="w-full md:w-32 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl h-10 shadow-lg shadow-indigo-500/20" onClick={() => toast.info("Please use the real-time notification popup to approve requests.")}>
                                            View Details
                                        </Button>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Requested {new Date(req.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="p-20 text-center border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-[2rem] space-y-4">
                            <div className="h-16 w-16 bg-slate-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-slate-200 mx-auto">
                                <Lock size={32} />
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No pending access requests</p>
                        </div>
                    )}
                </div>
            )}

            {/* Active Grants Tab */}
            {activeTab === "ACTIVE" && (
                <div className="space-y-6">
                    {activeGrants.length > 0 ? (
                        activeGrants.map((grant: any) => (
                            <Card key={grant.id} className="p-6 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 h-32 w-32 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                
                                <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                    <div className="flex gap-5">
                                        <div className="h-14 w-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 shrink-0">
                                            <Building2 size={28} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-lg tracking-tight uppercase">{grant.organization.name}</h3>
                                                <Badge className="bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 font-bold text-[9px] px-2 uppercase tracking-widest">Session Active</Badge>
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                                                <Eye size={12} className="text-indigo-600" /> {grant.accessType.replace(/_/g, ' ')} Access Granted
                                            </p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    <Clock size={12} /> Expiry: {grant.expiresAt ? new Date(grant.expiresAt).toLocaleTimeString() : "ONGOING"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center items-end gap-3">
                                        <Button variant="outline" className="w-full md:w-32 border-red-100 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10 font-black rounded-xl h-10 transition-all active:scale-95" onClick={() => handleRevoke(grant.id)}>
                                            Revoke Access
                                        </Button>
                                        <Button variant="ghost" className="w-full md:w-32 text-slate-400 font-bold text-[10px] h-8 uppercase tracking-widest">
                                            Audit Logs
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="p-20 text-center border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-[2rem] space-y-4">
                            <div className="h-16 w-16 bg-slate-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-slate-200 mx-auto">
                                <ShieldCheck size={32} />
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active permission grants</p>
                        </div>
                    )}
                </div>
            )}

            {/* History Tab */}
            {activeTab === "HISTORY" && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-[1.5rem] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-50 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
                                    <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Organization</th>
                                    <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Status</th>
                                    <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Granted On</th>
                                    <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-right">Reference</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
                                {isHistoryLoading ? (
                                    [1, 2, 3].map((i) => <tr key={i}><td colSpan={4} className="px-8 py-5 animate-pulse"><div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-full" /></td></tr>)
                                ) : historicalGrants.length > 0 ? (
                                    historicalGrants.map((grant: any) => (
                                        <tr key={grant.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-all cursor-pointer group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-slate-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all">
                                                        <Building2 size={18} />
                                                    </div>
                                                    <span className="font-bold uppercase text-xs tracking-tight">{grant.organization.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {grant.status === 'REVOKED' ? (
                                                    <Badge className="bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 font-black text-[9px] uppercase">REVOKED</Badge>
                                                ) : (
                                                    <Badge className="bg-slate-50 text-slate-600 border-slate-100 dark:bg-zinc-800 dark:text-slate-400 dark:border-zinc-700 font-black text-[9px] uppercase">EXPIRED</Badge>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-slate-500 font-mono text-xs">
                                                {new Date(grant.grantedAt).toLocaleDateString()} at {new Date(grant.grantedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-8 py-5 text-right font-mono text-[10px] text-slate-300 uppercase">
                                                AUTH_LOG_{grant.id.slice(-6)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center space-y-4">
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No historical grants recorded.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
