"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shield, Save, Loader2, Key } from "lucide-react";

export default function AdminSettingsPage() {
    const { user, isLoading: isAuthLoading, refreshUser } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({ username: "" });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "success" });

    useEffect(() => {
        if (user) {
            setFormData({ username: user.username || "" });
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ text: "", type: "success" });
        try {
            await api.patch("/users/profile", formData);
            await refreshUser();
            setMessage({ text: "Admin account updated.", type: "success" });
        } catch (err: any) {
            setMessage({ text: err.response?.data?.message || "Update failed.", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-500">Loading vault...</div>;
    if (!user || user.role !== 'ADMIN') return null;

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center p-6 py-12">
            <div className="max-w-xl w-full space-y-8">
                <Button variant="ghost" onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-300">
                    <ArrowLeft className="mr-2" size={18} /> Exit Vault
                </Button>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <Shield className="text-red-600" size={32} />
                        System Admin Configuration
                    </h1>
                    <p className="text-zinc-500 text-lg">Modify administrative access parameters.</p>
                </div>

                <Card className="p-8 shadow-3xl bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-zinc-400">Admin Identifier</Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                                <Input
                                    id="username"
                                    className="pl-10 bg-zinc-950 border-zinc-800 text-white focus:ring-red-600"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    disabled={isSaving}
                                    required
                                />
                            </div>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-md text-sm border ${message.type === "success"
                                    ? "bg-green-900/20 text-green-400 border-green-900/50"
                                    : "bg-red-900/20 text-red-400 border-red-900/50"
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold border-0" disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                            Update Admin Profile
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
