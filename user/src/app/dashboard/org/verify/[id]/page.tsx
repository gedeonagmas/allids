"use client";

import React, { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ShieldCheck,
    ArrowLeft,
    Clock,
    FileText,
    User,
    FileSearch,
    AlertCircle
} from "lucide-react";

export default function GrantDataView() {
    const params = useParams();
    const grantId = params?.id;
    const router = useRouter();

    const { data: grant, isLoading, error } = useQuery({
        queryKey: ['grant-data', grantId],
        queryFn: async () => {
            const res = await api.get(`/verification/grant/${grantId}`);
            return res.data;
        },
        enabled: !!grantId,
    });

    if (isLoading) return <div className="p-10 text-center">Loading shared data...</div>;

    if (error) {
        return (
            <div className="p-10 flex flex-col items-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h2 className="text-xl font-bold">Access Denied or Expired</h2>
                <p className="text-muted-foreground">The data session may have expired or you don't have permission to view this.</p>
                <Button onClick={() => router.push('/dashboard/org')}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 py-10">
            <div className="max-w-4xl mx-auto px-6 space-y-8">
                <Button variant="ghost" onClick={() => router.push('/dashboard/org')} className="gap-2">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Button>

                <section className="bg-white rounded-3xl p-8 border shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b pb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600/10 rounded-2xl">
                                <ShieldCheck className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Verified Identity Record</h1>
                                <p className="text-sm text-muted-foreground font-medium">Verified by Allids Protocol</p>
                            </div>
                        </div>
                        {grant.expiresAt && (
                            <div className="text-right">
                                <Badge variant="outline" className="text-red-600 border-red-100 bg-red-50 gap-1.5 py-1">
                                    <Clock size={12} /> Session Expiring: {new Date(grant.expiresAt).toLocaleTimeString()}
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                    <User size={14} /> Shared Profile Data
                                </h3>
                                <div className="space-y-3">
                                    {grant.documentFields?.map((field: any) => {
                                        const labelMap: Record<string, string> = {
                                            firstName: 'First Name',
                                            lastName: 'Last Name',
                                            documentNumber: 'ID Number',
                                            dateOfExpiry: 'Expiry Date',
                                            dateOfBirth: 'Date of Birth',
                                            sex: 'Gender',
                                            nationality: 'Nationality'
                                        };
                                        return (
                                            <div key={field.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex justify-between items-center group">
                                                <span className="text-sm font-bold text-zinc-500">{labelMap[field.fieldKey] || field.fieldKey}</span>
                                                <span className="text-sm font-black text-blue-700">{field.fieldValue || 'N/A'}</span>
                                            </div>
                                        );
                                    })}
                                    {!grant.documentFields?.length && <p className="text-sm text-zinc-400 italic">No specific KYC fields shared.</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                    <FileSearch size={14} /> Document Metadata
                                </h3>
                                <div className="p-4 border rounded-2xl space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-500 font-bold">Document Type</span>
                                        <span className="font-black uppercase">{grant.type.replace(/_/g, ' ')}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-500 font-bold">Issuer Country</span>
                                        <span className="font-black">{grant.issuerCountry || 'Global'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-500 font-bold">Status</span>
                                        <Badge className="bg-green-500/10 text-green-600 border-green-100 hover:bg-green-200/20">{grant.status}</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <FileText size={14} /> Document Image Preview
                            </h3>
                            <div className="aspect-[3/4] rounded-3xl border-2 border-dashed bg-zinc-100 flex flex-col items-center justify-center p-8 text-center gap-4 relative overflow-hidden">
                                {grant.accessType === 'FULL_IMAGE' ? (
                                    <>
                                        {/* In a real app, you'd show the image here. For now, we simulate. */}
                                        <img
                                            src={`/api/placeholder/600/800`}
                                            alt="Document Preview"
                                            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm"
                                        />
                                        <div className="relative z-10 space-y-2">
                                            <Badge className="bg-blue-600">CONFIDENTIAL IMAGE ACCESS</Badge>
                                            <p className="text-xs font-medium text-zinc-500 px-4">
                                                Full image access is granted for this session. This image will be unavailable after the session expires.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-12 w-12 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-400">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Image Not Accessible</p>
                                        <p className="text-[10px] text-zinc-400">Only text data was shared for this KYC request.</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <Card className="p-6 bg-zinc-900 border-0 text-white shadow-2xl overflow-hidden relative">
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="font-bold">Audit Traceability</h3>
                            <p className="text-xs text-zinc-400">Every access to this data is logged and visible to the data owner.</p>
                        </div>
                        <Badge variant="outline" className="text-white border-white/20">Immutable Log</Badge>
                    </div>
                    <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/10 rounded-full blur-2xl" />
                </Card>
            </div>
        </div>
    );
}
