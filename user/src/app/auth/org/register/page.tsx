"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { Building2, User, Mail, MapPin, ShieldCheck, Loader2 } from "lucide-react";

const ORG_TYPES = [
    { value: "BANK", label: "Financial Institution / Bank" },
    { value: "EMBASSY", label: "Embassy / Consulate" },
    { value: "TRAFFIC_AUTHORITY", label: "Traffic / Transport Authority" },
    { value: "OTHER", label: "Other Business Entity" },
];

export default function OrgRegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        organizationType: "OTHER",
        contactEmail: "",
        username: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            await api.post("/auth/register-org", formData);
            router.push("/auth/org/login?registered=true");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please bridge the missing fields.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 py-12">
            <Card className="max-w-xl w-full p-8 shadow-xl space-y-8 bg-white/80 backdrop-blur-md dark:bg-zinc-900/80">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                            <ShieldCheck />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Register Organization
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Apply for an institutional account to start verifying identities.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="name">Organization Legal Name</Label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input
                                id="name"
                                placeholder="Global Bank Inc."
                                className="pl-10"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="orgType">Organization Type</Label>
                        <select
                            id="orgType"
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                            value={formData.organizationType}
                            onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                            disabled={isLoading}
                            required
                        >
                            {ORG_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Contact Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="contact@org.com"
                                className="pl-10"
                                value={formData.contactEmail}
                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Headquarters Address</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input
                                id="address"
                                placeholder="123 Business St, Financial District"
                                className="pl-10"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">Account Username</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input
                                id="username"
                                placeholder="admin_username"
                                className="pl-10"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                disabled={isLoading}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Security Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            disabled={isLoading}
                            required
                            minLength={8}
                        />
                    </div>

                    <Button type="submit" className="md:col-span-2 w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Complete Registration"}
                    </Button>
                </form>

                <div className="text-center pt-4 border-t dark:border-zinc-800">
                    <p className="text-sm text-zinc-500">
                        Already have an organization account?{" "}
                        <Link href="/auth/org/login" className="text-blue-600 hover:underline font-semibold">
                            Sign In
                        </Link>
                    </p>
                </div>
            </Card>

            <Button variant="ghost" asChild className="mt-8">
                <Link href="/">Back to choice</Link>
            </Button>
        </div>
    );
}
