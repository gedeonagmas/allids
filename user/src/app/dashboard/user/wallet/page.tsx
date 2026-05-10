"use client";

import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Wallet,
    Plus,
    Trash2,
    CheckCircle2,
    ArrowRight,
    Globe,
    CreditCard,
    ShieldCheck,
    QrCode,
    Calendar,
    MoreHorizontal
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function WalletPage() {
    const { user } = useAuth();
    const router = useRouter();

    const { data: wallet, isLoading, refetch } = useQuery({
        queryKey: ["wallet"],
        queryFn: async () => {
            const res = await api.get("/documents/wallet");
            return res.data;
        },
    });

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this document from your active wallet?")) return;
        try {
            await api.delete(`/documents/${id}`);
            toast.success("Document removed from wallet");
            refetch();
        } catch (err) {
            toast.error("Failed to delete document");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Identity Wallet</h1>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">Your verified digital credentials and assets.</p>
                </div>
                <Button className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 gap-2 font-bold" asChild>
                    <Link href="/dashboard/user/upload">
                        <Plus size={18} />
                        Add Credential
                    </Link>
                </Button>
            </div>

            {/* Wallet Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="aspect-[1.6/1] rounded-[2rem] bg-slate-100 dark:bg-zinc-900 animate-pulse" />
                    ))
                ) : wallet?.length > 0 ? (
                    wallet.map((doc: any) => (
                        <div key={doc.id} className="group perspective-1000">
                            <Card className="relative aspect-[1.6/1] rounded-[1.5rem] overflow-hidden border-0 shadow-2xl transition-all duration-500 group-hover:rotate-y-6 group-hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-slate-900 to-zinc-800 text-white p-8 flex flex-col justify-between">
                                {/* Glassmorphism Background Accents */}
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                                
                                {/* Card Top */}
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                                            <ShieldCheck size={20} className="text-indigo-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Verified ID</span>
                                            <span className="font-bold tracking-tight uppercase text-sm">{doc.type.replace(/_/g, ' ')}</span>
                                        </div>
                                    </div>
                                    <CheckCircle2 size={24} className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                </div>

                                {/* Card Middle */}
                                <div className="space-y-1 relative z-10 mt-4">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Issuer Jurisdiction</p>
                                    <div className="flex items-center gap-2">
                                        <Globe size={14} className="text-zinc-500" />
                                        <p className="font-black tracking-tight">{doc.issuerCountry || "Global Identity"}</p>
                                    </div>
                                </div>

                                {/* Card Bottom */}
                                <div className="flex items-end justify-between relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Expiry Date</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-zinc-500" />
                                            <p className="font-mono text-xs">{doc.expiredDate ? new Date(doc.expiredDate).toLocaleDateString() : "NEVER EXPIRES"}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/5" asChild>
                                            <Link href={`/dashboard/user/documents/${doc.id}`}>
                                                <QrCode size={18} />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-red-400 hover:text-red-500" onClick={() => handleDelete(doc.id)}>
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))
                ) : (
                    <Card className="col-span-full border-2 border-dashed border-slate-200 dark:border-zinc-800 p-20 text-center bg-transparent flex flex-col items-center justify-center space-y-6 rounded-[2rem]">
                        <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-slate-300">
                            <Wallet size={40} />
                        </div>
                        <div className="space-y-2 max-w-sm">
                            <p className="font-black text-xl tracking-tight">Your wallet is empty</p>
                            <p className="text-sm text-slate-500 font-medium">Verified documents will appear here as premium digital cards after AI verification.</p>
                        </div>
                        <Button className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20" asChild>
                            <Link href="/dashboard/user/upload">Start Verification</Link>
                        </Button>
                    </Card>
                )}
            </div>

            {/* Quick Tips Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                <Card className="p-8 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm flex items-start gap-6 group cursor-pointer hover:border-indigo-600 transition-colors">
                    <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
                        <QrCode size={24} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-black text-lg tracking-tight uppercase">Quick Share Access</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">Instantly share your verified credentials via encrypted QR codes or secure one-time links.</p>
                        <Button variant="ghost" className="p-0 text-indigo-600 font-bold hover:bg-transparent group-hover:translate-x-1 transition-all">
                            Learn more <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </div>
                </Card>

                <Card className="p-8 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm flex items-start gap-6 group cursor-pointer hover:border-indigo-600 transition-colors">
                    <div className="h-12 w-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 shrink-0 group-hover:scale-110 transition-transform">
                        <CreditCard size={24} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-black text-lg tracking-tight uppercase">Offline Mode</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">Coming soon: Download cryptographically signed proofs of identity for offline institutional use.</p>
                        <Badge className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-0 font-black text-[10px]">ROADMAP</Badge>
                    </div>
                </Card>
            </div>
        </div>
    );
}
