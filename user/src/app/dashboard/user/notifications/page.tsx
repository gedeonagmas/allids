"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Bell,
    ShieldCheck,
    ShieldAlert,
    Clock,
    Eye,
    Building2,
    Lock,
    Zap,
    CheckCircle2,
    XCircle,
    Info
} from "lucide-react";

export default function NotificationsPage() {
    const [filter, setFilter] = useState<"ALL" | "SECURITY" | "REQUESTS" | "VERIFICATION">("ALL");

    // Fetch audit logs as notifications
    const { data: auditLogs, isLoading } = useQuery({
        queryKey: ["user-audit-notifications"],
        queryFn: async () => {
            const res = await api.get("/verification/audit");
            return res.data;
        },
    });

    // Fetch pending requests for "REQUESTS" filter
    const { data: requests } = useQuery({
        queryKey: ["user-pending-requests-notif"],
        queryFn: async () => {
            const res = await api.get("/verification/requests");
            return res.data;
        },
    });

    // Aggregate and filter
    const notifications = [
        ...(requests?.map((r: any) => ({
            id: r.id,
            type: "REQUEST",
            title: "Access Request Received",
            message: `${r.organization.name} is requesting access to your ${r.documentType.replace(/_/g, ' ')}.`,
            timestamp: r.createdAt,
            category: "REQUESTS",
            icon: Building2,
            iconColor: "text-indigo-600",
            bgColor: "bg-indigo-50 dark:bg-indigo-900/20"
        })) || []),
        ...(auditLogs?.map((log: any) => {
            let config = {
                title: "System Update",
                message: log.action,
                category: "SECURITY",
                icon: Info,
                iconColor: "text-slate-400",
                bgColor: "bg-slate-50 dark:bg-zinc-900/40"
            };

            if (log.action === 'GRANT_CREATED') {
                config = {
                    title: "Access Permission Granted",
                    message: `You successfully shared ${log.permissionGrant.document.type} with ${log.permissionGrant.organization.name}.`,
                    category: "VERIFICATION",
                    icon: ShieldCheck,
                    iconColor: "text-green-600",
                    bgColor: "bg-green-50 dark:bg-green-900/20"
                };
            } else if (log.action === 'DATA_ACCESSED') {
                config = {
                    title: "Identity Data Accessed",
                    message: `${log.permissionGrant.organization.name} viewed your ${log.permissionGrant.document.type} via secure grant.`,
                    category: "SECURITY",
                    icon: Eye,
                    iconColor: "text-blue-600",
                    bgColor: "bg-blue-50 dark:bg-blue-900/20"
                };
            } else if (log.action === 'GRANT_REVOKED') {
                config = {
                    title: "Access Revoked",
                    message: `You terminated ${log.permissionGrant.organization.name}'s access to your data.`,
                    category: "SECURITY",
                    icon: ShieldAlert,
                    iconColor: "text-red-600",
                    bgColor: "bg-red-50 dark:bg-red-900/20"
                };
            }

            return {
                id: log.id,
                type: "AUDIT",
                ...config,
                timestamp: log.timestamp
            };
        }) || [])
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const filteredNotifications = notifications.filter(n => {
        if (filter === "ALL") return true;
        return n.category === filter;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Notification Hub</h1>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">Real-time alerts regarding your identity security and access.</p>
                </div>
                <div className="flex p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl overflow-hidden shrink-0">
                    {(["ALL", "SECURITY", "REQUESTS", "VERIFICATION"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                filter === t 
                                ? "bg-white dark:bg-zinc-950 text-indigo-600 shadow-sm" 
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {isLoading ? (
                    [1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-zinc-900 animate-pulse" />)
                ) : filteredNotifications.length > 0 ? (
                    filteredNotifications.map((n) => (
                        <Card key={n.id} className="p-5 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm group hover:border-indigo-600 transition-all cursor-pointer">
                            <div className="flex items-start gap-5">
                                <div className={`h-12 w-12 rounded-2xl ${n.bgColor} flex items-center justify-center ${n.iconColor} shrink-0 group-hover:scale-110 transition-transform`}>
                                    <n.icon size={24} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black text-sm uppercase tracking-tight">{n.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                {new Date(n.timestamp).toLocaleDateString()} at {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{n.message}</p>
                                    <div className="pt-2 flex items-center gap-3">
                                        <Badge variant="ghost" className="p-0 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-600 transition-colors">
                                            {n.category} • TRANSACTION_ID_{n.id.slice(-6).toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="p-24 text-center space-y-6">
                        <div className="h-20 w-20 bg-slate-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-slate-200 mx-auto">
                            <Bell size={40} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-xl tracking-tight uppercase">No alerts found</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">Your notification history is clean. We'll alert you of any security events.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Notification Preferences Quick Link */}
            <Card className="p-8 bg-slate-900 text-white border-0 shadow-xl overflow-hidden relative group mt-12">
                <Zap className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2 text-center md:text-left">
                        <h4 className="text-xl font-black tracking-tight uppercase">Push Notifications</h4>
                        <p className="text-zinc-400 text-sm font-medium">Enable real-time mobile alerts to monitor your identity on the go.</p>
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 h-12 rounded-xl">
                        Enable Mobile Push
                    </Button>
                </div>
            </Card>
        </div>
    );
}
