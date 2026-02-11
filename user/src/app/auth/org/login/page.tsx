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
import { Building2, Lock, User, Loader2 } from "lucide-react";

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
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
            <Card className="max-w-md w-full p-8 shadow-xl space-y-8 bg-white/80 backdrop-blur-md dark:bg-zinc-900/80">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                            <Building2 />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Org Portal Login
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Access your organization dashboard
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input
                                id="username"
                                placeholder="org_handle"
                                className="pl-10"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Sign In to Org"}
                    </Button>
                </form>

                <div className="text-center space-y-2">
                    <p className="text-sm text-zinc-500">
                        Need an organization account?
                    </p>
                    <Button variant="outline" asChild className="w-full">
                        <Link href="/auth/org/register">Register Organization</Link>
                    </Button>
                </div>
            </Card>

            <Button variant="ghost" asChild className="mt-8">
                <Link href="/">Back to choice</Link>
            </Button>
        </div>
    );
}
