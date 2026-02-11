"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Phone, Save, Loader2, ShieldCheck } from "lucide-react";

export default function UserSettingsPage() {
    const { user, isLoading: isAuthLoading, refreshUser } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({ name: "", phone: "" });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "success" });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                phone: user.phone || ""
            });
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ text: "", type: "success" });
        try {
            await api.patch("/users/profile", formData);
            await refreshUser();
            setMessage({ text: "Profile updated successfully!", type: "success" });
        } catch (err: any) {
            setMessage({ text: err.response?.data?.message || "Failed to update profile.", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center">Loading settings...</div>;
    if (!user || user.role !== 'USER') return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center p-6 py-12">
            <div className="max-w-xl w-full space-y-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2" size={18} /> Back to Dashboard
                </Button>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Profile Settings</h1>
                    <p className="text-zinc-500 text-lg">Manage your personal information and verified phone number.</p>
                </div>

                <Card className="p-8 shadow-xl bg-white/80 backdrop-blur-md dark:bg-zinc-900/80">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    className="pl-10"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number (Verified)</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="phone"
                                    placeholder="251 900 000 000"
                                    className="pl-10"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    disabled={isSaving}
                                    required
                                />
                            </div>
                            <p className="text-xs text-zinc-500 flex items-center gap-1">
                                <ShieldCheck size={12} className="text-green-600" />
                                Your phone is used for secure OTP login.
                            </p>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-md text-sm border ${message.type === "success"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-12 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 text-white font-bold" disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                            Save Changes
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
