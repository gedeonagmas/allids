"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { ShieldAlert, Lock, User, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { user, refreshUser } = useAuth();

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            router.push('/');
        }
    }, [user, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            await api.post("/auth/login", formData);
            await refreshUser();
            router.push("/");
        } catch (err: any) {
            setError(err.response?.data?.message || "Admin login failed. Unauthorized.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-6">
            <Card className="max-w-md w-full p-8 shadow-2xl border-zinc-800 space-y-8 bg-zinc-950/50 backdrop-blur-xl">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center text-white">
                            <ShieldAlert />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
                        System Administration
                    </h1>
                    <p className="text-zinc-500">
                        Secure access for authorized personnel only.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-900/20 text-red-400 text-sm rounded-md border border-red-900/50">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-zinc-300">Admin Username</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                id="username"
                                placeholder="root_admin"
                                className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-red-600"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-zinc-300">Security Phrase</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-red-600"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 bg-red-600 hover:bg-red-700 text-white border-0" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Authenticate"}
                    </Button>
                </form>

                <div className="text-center text-xs text-zinc-600 uppercase tracking-widest pt-4">
                    Encrypted Session Active
                </div>
            </Card>

            <p className="mt-8 text-sm text-zinc-700">
                &copy; 2026 Allids Security Layer
            </p>
        </div>
    );
}
