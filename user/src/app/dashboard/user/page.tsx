"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    RefreshCw,
    LogOut,
    User,
    Clock,
    Globe,
    CheckCircle2,
    AlertCircle,
    FileText
} from "lucide-react";

export default function UserDashboard() {
    const { user, isLoading: isAuthLoading, logout } = useAuth();
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);

    // Protected route check
    useEffect(() => {
        if (!isAuthLoading && (!user || user.role !== 'USER')) {
            router.push("/");
        }
    }, [user, isAuthLoading, router]);

    // Fetch verified documents (wallet)
    const { data: wallet, isLoading: isWalletLoading, refetch: refetchWallet } = useQuery({
        queryKey: ["wallet"],
        queryFn: async () => {
            const res = await api.get("/documents/wallet");
            return res.data;
        },
        enabled: !!user && user.role === 'USER',
    });

    // Fetch all documents (including pending/rejected)
    const { data: allDocs, isLoading: isDocsLoading, refetch: refetchDocs } = useQuery({
        queryKey: ["all-documents"],
        queryFn: async () => {
            const res = await api.get("/documents");
            return res.data;
        },
        enabled: !!user && user.role === 'USER',
    });

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            await api.delete(`/documents/${id}`);
            refetchDocs();
            refetchWallet();
        } catch (err) {
            alert("Failed to delete document");
        }
    };

    if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans">
            {/* Navbar */}
            <nav className="border-b bg-white dark:bg-zinc-900 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <Wallet size={18} />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Allids <span className="text-zinc-400 font-normal">Wallet</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right mr-2">
                            <p className="text-sm font-semibold">{user.phone}</p>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Verified Identity</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={logout}>
                            <LogOut size={18} className="text-zinc-500" />
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto w-full px-6 py-10 space-y-12">
                {/* Welcome Section */}
                <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold tracking-tight">Your Identity Wallet</h1>
                        <p className="text-zinc-500 text-lg">Manage your verified documents and sharing permissions.</p>
                    </div>
                    <Button asChild className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 gap-2">
                        <Link href="/dashboard/user/upload">
                            <Plus size={20} />
                            Add New Document
                        </Link>
                    </Button>
                </section>

                {/* Verified Documents (Wallet) */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold">Verified Cards</h2>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                            Live Assets
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isWalletLoading ? (
                            [1, 2].map((i) => (
                                <div key={i} className="h-48 rounded-2xl bg-zinc-200 animate-pulse" />
                            ))
                        ) : wallet?.length > 0 ? (
                            wallet.map((doc: any) => (
                                <Card key={doc.id} className="relative overflow-hidden group border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all duration-300">
                                    <div className="absolute top-0 right-0 p-4">
                                        <CheckCircle2 className="text-green-500" size={24} />
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">{doc.type}</p>
                                            <h3 className="text-xl font-bold">{doc.issuerCountry || "Verified Document"}</h3>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase text-zinc-400 font-bold">Fields</p>
                                                <p className="font-mono text-sm">{doc.fieldsCount || 0} extracted</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase text-zinc-400 font-bold">Expires</p>
                                                <p className="font-mono text-sm">{doc.expiredDate ? new Date(doc.expiredDate).toLocaleDateString() : "Never"}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between border-t dark:border-zinc-800">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-blue-600 hover:bg-blue-50"
                                                onClick={() => router.push(`/dashboard/user/documents/${doc.id}`)}
                                            >
                                                View Details
                                            </Button>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600" onClick={() => handleDelete(doc.id)}>
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <Card className="col-span-full border-dashed p-12 text-center bg-transparent flex flex-col items-center justify-center space-y-4">
                                <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                                    <Wallet size={32} />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-lg">No verified documents yet</p>
                                    <p className="text-sm text-zinc-500">Upload your first document to activate your wallet.</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </section>

                {/* History / All Documents */}
                <section className="space-y-4 pt-10">
                    <h2 className="text-xl font-bold">Activity History</h2>
                    <div className="bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b bg-zinc-50/50 dark:bg-zinc-950/30">
                                    <th className="px-6 py-4 font-bold">Document</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold">Uploaded</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isDocsLoading ? (
                                    [1, 2].map((i) => (
                                        <tr key={i}><td colSpan={4} className="h-12 bg-zinc-50/20 animate-pulse" /></tr>
                                    ))
                                ) : allDocs?.map((doc: any) => (
                                    <tr key={doc.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500">
                                                <FileText size={16} />
                                            </div>
                                            <span className="font-semibold uppercase text-[10px] tracking-wider">{doc.type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {doc.status === 'VERIFIED' ? (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">{doc.status}</Badge>
                                                ) : doc.status === 'REJECTED' ? (
                                                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">{doc.status}</Badge>
                                                ) : (
                                                    <Badge variant="secondary">{doc.status}</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">
                                            {new Date(doc.createdAt).toLocaleDateString()} at {new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)} className="text-zinc-400 hover:text-red-600">
                                                <Trash2 size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
