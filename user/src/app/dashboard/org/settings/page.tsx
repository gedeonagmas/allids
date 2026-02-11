"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2, MapPin, Mail, Save, Loader2, Globe } from "lucide-react";

const ORG_TYPES = [
    { value: "BANK", label: "Financial Institution / Bank" },
    { value: "EMBASSY", label: "Embassy / Consulate" },
    { value: "TRAFFIC_AUTHORITY", label: "Traffic / Transport Authority" },
    { value: "OTHER", label: "Other Business Entity" },
];

export default function OrgSettingsPage() {
    const { user, isLoading: isAuthLoading, refreshUser } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        organizationType: "OTHER",
        contactEmail: ""
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "success" });

    useEffect(() => {
        // We fetch fresh profile data
        const fetchProfile = async () => {
            try {
                const res = await api.get("/users/profile");
                setFormData({
                    name: res.data.name || "",
                    address: res.data.address || "",
                    organizationType: res.data.organizationType || "OTHER",
                    contactEmail: res.data.contactEmail || "",
                });
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };
        if (user) fetchProfile();
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ text: "", type: "success" });
        try {
            await api.patch("/users/profile", formData);
            await refreshUser();
            setMessage({ text: "Organization profile updated!", type: "success" });
        } catch (err: any) {
            setMessage({ text: err.response?.data?.message || "Update failed.", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center">Loading institutional settings...</div>;
    if (!user || user.role !== 'ORG') return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center p-6 py-12">
            <div className="max-w-xl w-full space-y-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2" size={18} /> Back to Dashboard
                </Button>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Institution Profile</h1>
                    <p className="text-zinc-500 text-lg">Update your public identity and contact details.</p>
                </div>

                <Card className="p-8 shadow-xl bg-white/80 backdrop-blur-md dark:bg-zinc-900/80">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Legal Entity Name</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="name"
                                    className="pl-10"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={isSaving}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="orgType">Institution Category</Label>
                            <select
                                id="orgType"
                                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                value={formData.organizationType}
                                onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                                disabled={isSaving}
                            >
                                {ORG_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Public Contact Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    className="pl-10"
                                    value={formData.contactEmail}
                                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Headquarters Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="address"
                                    className="pl-10"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-md text-sm border ${message.type === "success"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                            Save Institutional Data
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
