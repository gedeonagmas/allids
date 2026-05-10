"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ShieldCheck,
    Upload,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Scan,
    FileText,
    Plus,
    AlertCircle,
    Info,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerificationPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "VERIFIED" | "REJECTED">("ALL");

    // Fetch all documents
    const { data: allDocs, isLoading, refetch } = useQuery({
        queryKey: ["all-documents-verification"],
        queryFn: async () => {
            const res = await api.get("/documents");
            return res.data;
        },
    });

    const filteredDocs = allDocs?.filter((doc: any) => {
        if (activeTab === "ALL") return true;
        return doc.status === activeTab;
    }) || [];

    const categories = [
        { name: "Personal ID", icon: FileText, desc: "National ID, Residence Permit", count: allDocs?.filter((d: any) => d.type === 'NATIONAL_ID').length || 0 },
        { name: "Passport", icon: Globe, desc: "International Travel Documents", count: allDocs?.filter((d: any) => d.type === 'PASSPORT').length || 0 },
        { name: "Driver License", icon: CreditCard, desc: "Driving Permissions", count: allDocs?.filter((d: any) => d.type === 'DRIVER_LICENSE').length || 0 },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Identity Verification</h1>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">Verify your credentials using AI-powered authenticity checks.</p>
                </div>
                <Button className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 gap-2 font-bold" asChild>
                    <Link href="/dashboard/user/upload">
                        <Scan size={18} />
                        New Verification
                    </Link>
                </Button>
            </div>

            {/* Verification Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((cat) => (
                    <Card key={cat.name} className="p-6 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between group hover:border-indigo-600 transition-colors cursor-pointer">
                        <div className="space-y-4">
                            <div className="h-12 w-12 bg-slate-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                                <cat.icon size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-tight">{cat.name}</h3>
                                <p className="text-xs text-slate-500 mt-1">{cat.desc}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50 dark:border-zinc-800">
                            <Badge variant="outline" className="text-[10px] font-black">{cat.count} VERIFIED</Badge>
                            <ArrowUpRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-all" />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Smart Guidance Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card className="p-8 bg-indigo-600 text-white border-0 shadow-xl relative overflow-hidden group">
                    <ShieldCheck className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-2">
                            <Info size={18} className="text-indigo-200" />
                            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-200">AI Guidance</h4>
                        </div>
                        <h4 className="text-2xl font-black leading-tight">For 100% Success Rate</h4>
                        <ul className="space-y-2 text-sm font-medium text-indigo-100">
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 bg-indigo-300 rounded-full" />
                                Use original physical documents only
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 bg-indigo-300 rounded-full" />
                                Ensure all 4 corners are visible
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 bg-indigo-300 rounded-full" />
                                Avoid glare or heavy shadows
                            </li>
                        </ul>
                    </div>
                 </Card>

                 <Card className="p-8 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                        <Activity size={18} className="text-indigo-600" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Security Context</h4>
                    </div>
                    <h4 className="text-xl font-black tracking-tight">Regula AI Pipeline</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Your documents are processed through an automated biometric and OCR pipeline. 
                        No data is shared with third parties without your explicit cryptographic consent.
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                        <div className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[9px] font-black border border-green-100 dark:border-green-800 uppercase tracking-widest">
                            ISO 27001 COMPLIANT
                        </div>
                    </div>
                 </Card>
            </div>

            {/* Verification History Section */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="font-black text-xl tracking-tight uppercase">Verification History</h3>
                    <div className="flex p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl overflow-hidden shrink-0">
                        {(["ALL", "PENDING", "VERIFIED", "REJECTED"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                    activeTab === tab 
                                    ? "bg-white dark:bg-zinc-950 text-indigo-600 shadow-sm" 
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-[1.5rem] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-50 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
                                    <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Document Type</th>
                                    <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Status</th>
                                    <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Submission Date</th>
                                    <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-right">Reference</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
                                {isLoading ? (
                                    [1, 2, 3].map((i) => (
                                        <tr key={i}><td colSpan={4} className="px-8 py-5 animate-pulse"><div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-full" /></td></tr>
                                    ))
                                ) : filteredDocs.length > 0 ? (
                                    filteredDocs.map((doc: any) => (
                                        <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-all cursor-pointer group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-slate-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all">
                                                        <FileText size={18} />
                                                    </div>
                                                    <span className="font-bold uppercase text-xs tracking-tight">{doc.type.replace(/_/g, ' ')}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {doc.status === 'VERIFIED' ? (
                                                    <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 font-bold px-3">
                                                        <CheckCircle2 size={12} className="mr-1.5" /> VERIFIED
                                                    </Badge>
                                                ) : doc.status === 'REJECTED' ? (
                                                    <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 font-bold px-3">
                                                        <XCircle size={12} className="mr-1.5" /> REJECTED
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 font-bold px-3">
                                                        <Clock size={12} className="mr-1.5" /> PENDING
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-slate-500 font-mono text-xs">
                                                {new Date(doc.createdAt).toLocaleDateString()} at {new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-8 py-5 text-right font-mono text-[10px] text-slate-300">
                                                REF_{doc.id.slice(-8).toUpperCase()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center space-y-4">
                                            <div className="h-16 w-16 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-slate-200 mx-auto">
                                                <ShieldCheck size={32} />
                                            </div>
                                            <p className="text-slate-400 font-bold">No verification attempts found for this category.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

const CreditCard = ({ size, className }: { size?: number, className?: string }) => (
    <svg 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
);

const Globe = ({ size, className }: { size?: number, className?: string }) => (
    <svg 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" x2="22" y1="12" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);
