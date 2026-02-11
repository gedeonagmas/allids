"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { Smartphone, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function UserLoginPage() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { refreshUser } = useAuth();

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            await api.post("/auth/request-otp", { phone });
            setStep("otp");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to send OTP. Please check your phone number.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            await api.post("/auth/verify-otp", { phone, code: otp });
            await refreshUser();
            router.push("/dashboard/user");
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
            <Card className="max-w-md w-full p-8 shadow-xl space-y-8 bg-white/80 backdrop-blur-md dark:bg-zinc-900/80">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-zinc-900 dark:bg-zinc-50 rounded-xl flex items-center justify-center">
                            <Smartphone className="text-zinc-50 dark:text-zinc-900" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {step === "phone" ? "Enter your phone" : "Verify OTP"}
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        {step === "phone"
                            ? "We'll send you a one-time code to log in securely."
                            : `Code sent to ${phone}`}
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}

                {step === "phone" ? (
                    <form onSubmit={handleRequestOtp} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-zinc-400">+</span>
                                <Input
                                    id="phone"
                                    placeholder="251 900 000 000"
                                    className="pl-7"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-12" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                            Send One-Time Code
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="otp">One-Time Code</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="otp"
                                    placeholder="------"
                                    className="pl-10 tracking-[1em] text-center"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-12" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Verify & Continue"}
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={() => setStep("phone")} disabled={isLoading}>
                            Change phone number
                        </Button>
                    </form>
                )}
            </Card>

            <p className="mt-8 text-sm text-zinc-500">
                Don't have an account? Regular users are automatically registered upon first successful OTP.
            </p>
        </div>
    );
}
