"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import {
    ShieldCheck,
    Lock,
    Fingerprint,
    Loader2,
    AlertCircle,
    ArrowLeft,
    Globe,
    Command,
    Terminal
} from "lucide-react";

export default function OrgLoginPage() {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { refreshUser } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            await api.post("/auth/login", formData);
            await refreshUser();
            router.push("/dashboard/org");
        } catch (err: any) {
            setError(err.response?.data?.message || "Authentication failed. Invalid system credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[98vh] overflow-y-hidden relative flex items-center justify-center py-2 px-6 overflow-hidden bg-slate-50">
            {/* High-End Institutional Background - Light Mode */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent_70%)]" />
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                {/* Abstract Data Lines - Subtle */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5">
                    <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] border-[1px] border-indigo-600 rounded-full rotate-12" />
                    <div className="absolute top-[10%] right-[-10%] w-[120%] h-[120%] border-[1px] border-indigo-600 rounded-full -rotate-12" />
                </div>
            </div>

            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[.5rem] border border-slate-200 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative z-10">
                {/* Left Side: Branding & Security Info */}
                <div className="p-12 bg-indigo-600 flex flex-col justify-between relative overflow-hidden hidden md:flex text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-xl">
                                <ShieldCheck size={24} />
                            </div>
                            <span className="font-black text-xl tracking-tighter uppercase">Global Identity</span>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-black leading-tight tracking-tight">
                                Internal Institutional <br /> Access Portal
                            </h2>
                            <p className="text-indigo-100/90 text-sm font-medium leading-relaxed max-w-xs">
                                Restricted system for authorized personnel and verified banking institutions. Authentication required to access the Identity Validation Cloud.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-4 text-xs font-bold text-white/60 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Globe size={14} /> Global Network</span>
                            <span className="flex items-center gap-1.5"><Terminal size={14} /> v4.2.0-HQ</span>
                        </div>
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
                            <p className="text-[10px] font-bold text-indigo-100/80 uppercase tracking-widest mb-1">Security Status</p>
                            <div className="text-xs font-black flex items-center gap-2">
                                <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
                                ALL SYSTEMS OPERATIONAL
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="p-12 flex flex-col justify-center bg-white">
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-indigo-600 text-white border-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
                                    HQ Terminal
                                </Badge>
                                <span className="h-1 w-1 bg-slate-200 rounded-full" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auth v4.2</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">System Authentication</h3>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Department</Label>
                                <div className="relative group">
                                    <select className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all appearance-none cursor-pointer">
                                        <option>Compliance & Audit</option>
                                        <option>Risk Management</option>
                                        <option>Institutional Lending</option>
                                        <option>Identity Operations</option>
                                        <option>Executive Oversight</option>
                                    </select>
                                    <div className="absolute right-4 top-5 pointer-events-none text-slate-400">
                                        <Globe size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">System Username</Label>
                                <div className="relative group">
                                    <Fingerprint className="absolute left-4 top-4 h-6 w-6 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                    <Input
                                        id="username"
                                        placeholder="terminal_id"
                                        className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:ring-indigo-600 focus:bg-white transition-all font-medium"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secure Passcode</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-4 h-6 w-6 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••••••"
                                        className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:ring-indigo-600 focus:bg-white transition-all"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-xl shadow-indigo-600/20 rounded-2xl transition-all active:scale-[0.98] mt-4" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "AUTHENTICATE TERMINAL"}
                            </Button>
                        </form>

                        <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                            <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest leading-relaxed">
                                AUTHORIZED ACCESS ONLY. SESSION ENCRYPTED VIA GLOBAL TRUST HSM.
                            </p>
                            <div className="flex justify-between items-center px-2">
                                <Link href="/auth/org/register" className="text-xs text-slate-400 hover:text-indigo-600 transition-colors font-bold uppercase tracking-wider">
                                    Provision Account
                                </Link>
                                <Link href="/" className="text-xs text-slate-400 hover:text-indigo-600 transition-colors font-bold uppercase tracking-wider flex items-center gap-1">
                                    <ArrowLeft size={12} /> Exit System
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Watermark - Subtle Gray */}
            <div className="absolute bottom-12 right-12 text-slate-100 pointer-events-none select-none hidden md:block">
                <Command size={400} />
            </div>

            <div className="absolute top-12 right-12 flex gap-8 text-slate-300 text-[10px] font-black tracking-[0.3em] uppercase z-10 hidden md:flex">
                <span>IDENTITY_CLOUD_BACKBONE</span>
                <span>SECURED_BY_HSM</span>
            </div>
        </div>
    );
}


function Badge({ children, className, variant }: any) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
            {children}
        </span>
    );
}

