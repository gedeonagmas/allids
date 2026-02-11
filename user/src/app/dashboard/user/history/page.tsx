"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
    CheckCircle2
} from "lucide-react";
import { toast } from 'sonner';

export default function UserHistoryPage() {
    const { data: grants, refetch, isLoading } = useQuery({
        queryKey: ['user-grants'],
        queryFn: async () => {
            const res = await api.get('/verification/history');
            return res.data;
        }
    });

    const handleRevoke = async (grantId: string) => {
        try {
            if (!confirm("Are you sure you want to revoke this organization's access immediately?")) return;

            await api.post(`/verification/revoke/${grantId}`);
            toast.success("Access revoked successfully.");
            refetch();
        } catch (error) {
            toast.error("Failed to revoke access.");
        }
    };

    if (isLoading) return <div className="p-12 text-center">Loading history...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <History className="text-blue-600" /> Identity History
                    </h1>
                    <p className="text-zinc-500 font-medium">Manage and audit who has access to your verified data.</p>
                </div>

                <div className="grid gap-6">
                    {grants && grants.length > 0 ? (
                        grants.map((grant: any) => (
                            <Card key={grant.id} className="p-6 border-zinc-200 overflow-hidden relative group">
                                <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                    <div className="flex gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                            <Building2 size={28} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{grant.organization.name}</h3>
                                                <Badge variant={grant.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-[10px] h-5">
                                                    {grant.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-medium text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider">
                                                <ShieldCheck size={14} className="text-blue-600" /> {grant.accessType.replace(/_/g, ' ')} Access
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400 font-bold">
                                                <span className="flex items-center gap-1"><Clock size={12} /> Granted: {new Date(grant.grantedAt).toLocaleDateString()}</span>
                                                {grant.expiresAt && (
                                                    <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                                        <Clock size={12} /> Expires: {new Date(grant.expiresAt).toLocaleTimeString()}
                                                    </span>
                                                )}
                                                {grant.revokedAt && (
                                                    <span className="flex items-center gap-1 text-red-600">
                                                        <ShieldX size={12} /> Revoked: {new Date(grant.revokedAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between items-end gap-4">
                                        <div className="flex gap-2">
                                            {grant.status === 'ACTIVE' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 border-red-100 hover:bg-red-50 font-bold h-9"
                                                    onClick={() => handleRevoke(grant.id)}
                                                >
                                                    Revoke Access
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-zinc-500 font-bold h-9 gap-2"
                                            >
                                                Audit Logs <ExternalLink size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative background element for active grants */}
                                {grant.status === 'ACTIVE' && (
                                    <div className="absolute top-0 right-0 h-32 w-32 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                )}
                            </Card>
                        ))
                    ) : (
                        <Card className="p-20 text-center border-dashed flex flex-col items-center gap-6 justify-center">
                            <div className="h-20 w-20 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-300">
                                <CheckCircle2 size={40} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold">No data shared yet</h3>
                                <p className="text-zinc-500 max-w-sm">When organizations request your identity, your history will appear here.</p>
                            </div>
                            <Button onClick={() => window.location.href = '/dashboard/user'}>Back to Wallet</Button>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
