"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    User, 
    Phone, 
    Save, 
    Loader2, 
    ShieldCheck, 
    Lock, 
    EyeOff, 
    Globe, 
    Smartphone,
    LogOut,
    Trash2,
    Key,
    Bell
} from "lucide-react";
import { toast } from "sonner";

export default function UserSettingsPage() {
    const { user, refreshUser, logout } = useAuth();
    const [formData, setFormData] = useState({ name: "", phone: "" });
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<"PROFILE" | "SECURITY" | "PRIVACY">("PROFILE");

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
        try {
            await api.patch("/users/profile", formData);
            await refreshUser();
            toast.success("Profile updated successfully!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Settings & Security</h1>
                <p className="text-slate-500 dark:text-zinc-400 font-medium">Manage your identity profile, security governance, and privacy rules.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Section Navigation */}
                <div className="space-y-2">
                    {[
                        { id: "PROFILE", label: "Identity Profile", icon: User },
                        { id: "SECURITY", label: "Security Hub", icon: Lock },
                        { id: "PRIVACY", label: "Privacy Rules", icon: EyeOff },
                    ].map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                                activeSection === section.id 
                                ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm border border-slate-100 dark:border-zinc-800" 
                                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-white"
                            }`}
                        >
                            <section.icon size={18} />
                            {section.label}
                        </button>
                    ))}
                    
                    <div className="pt-8 space-y-2">
                        <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Account Actions</p>
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 h-11 px-4 gap-3 rounded-xl transition-all font-bold"
                            onClick={logout}
                        >
                            <LogOut size={18} />
                            Logout Session
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 h-11 px-4 gap-3 rounded-xl transition-all font-bold"
                        >
                            <Trash2 size={18} />
                            Delete Account
                        </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-8">
                    {activeSection === "PROFILE" && (
                        <Card className="p-8 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm space-y-8">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black uppercase tracking-tight">Identity Profile</h3>
                                <p className="text-sm text-slate-500 font-medium">This information is used as the base for your verified credentials.</p>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6 max-w-xl">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Legal Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="name"
                                            placeholder="John Doe"
                                            className="pl-10 h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-bold"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="phone"
                                            placeholder="+251 900 000 000"
                                            className="pl-10 h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-bold"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            disabled={isSaving}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg border border-green-100 dark:border-green-800">
                                        <ShieldCheck size={14} />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Phone verified for secure authentication</p>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" className="w-full md:w-auto px-10 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-500/20 gap-2" disabled={isSaving}>
                                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        Update Identity
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {activeSection === "SECURITY" && (
                        <div className="space-y-8">
                            <Card className="p-8 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black uppercase tracking-tight">Governance & MFA</h3>
                                        <p className="text-sm text-slate-500 font-medium">Protect your account with additional layers of security.</p>
                                    </div>
                                    <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <Lock size={24} />
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-50 dark:divide-zinc-800">
                                    <div className="py-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-slate-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-slate-400">
                                                <Smartphone size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm uppercase">Authenticator App (TOTP)</p>
                                                <p className="text-xs text-slate-500 font-medium">Use apps like Google Authenticator or Authy.</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="rounded-xl font-bold h-9 border-slate-200">Enable</Button>
                                    </div>

                                    <div className="py-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-slate-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-slate-400">
                                                <Key size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm uppercase">Recovery Codes</p>
                                                <p className="text-xs text-slate-500 font-medium">Backup access if you lose your phone.</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="rounded-xl font-bold h-9 text-indigo-600">Generate</Button>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-8 bg-slate-900 text-white border-0 shadow-xl relative overflow-hidden group">
                                <ShieldCheck className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                                <div className="relative z-10 space-y-4">
                                    <h4 className="text-lg font-black leading-tight uppercase">Encryption Keys</h4>
                                    <p className="text-zinc-400 text-xs font-medium leading-relaxed max-w-md">Your data is encrypted using client-side generated keys. We never store your raw private keys on our servers.</p>
                                    <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 font-black rounded-xl h-9 px-4">
                                        Rotate Master Key
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeSection === "PRIVACY" && (
                        <Card className="p-8 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm space-y-8">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black uppercase tracking-tight">Privacy Rules</h3>
                                <p className="text-sm text-slate-500 font-medium">Control the default behavior of identity sharing.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm uppercase">Auto-Expire Permissions</p>
                                        <p className="text-xs text-slate-500 font-medium">Automatically revoke access after 30 days of inactivity.</p>
                                    </div>
                                    <div className="h-6 w-11 bg-indigo-600 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm uppercase">Notification Mirroring</p>
                                        <p className="text-xs text-slate-500 font-medium">Send all access alerts to your verified email address.</p>
                                    </div>
                                    <div className="h-6 w-11 bg-zinc-300 dark:bg-zinc-700 rounded-full relative cursor-pointer">
                                        <div className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

