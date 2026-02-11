"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Upload,
    FileImage,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    ShieldCheck,
    Scan
} from "lucide-react";
import Image from "next/image";

export default function DocumentUploadPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [docType, setDocType] = useState<string>("PASSPORT");
    const [status, setStatus] = useState<"idle" | "uploading" | "verifying" | "success" | "error">("idle");
    const [error, setError] = useState("");
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError("File size exceeds 10MB limit.");
                return;
            }
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError("");
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setStatus("idle");
        setError("");
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus("uploading");

        try {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("type", docType);

            setStatus("verifying");
            const res = await api.post("/documents/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setResult(res.data);
            setStatus("success");
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Upload or verification failed. Please try a clearer image.");
            setStatus("error");
        }
    };

    if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center">Checking permissions...</div>;
    if (!user || user.role !== 'USER') return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center p-6 py-12">
            <div className="max-w-2xl w-full space-y-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2" size={18} /> Back to Wallet
                </Button>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Scan className="text-blue-600" size={32} />
                        Add New Document
                    </h1>
                    <p className="text-zinc-500 text-lg">Our AI will verify your document authenticity instantly.</p>
                </div>

                <Card className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 backdrop-blur-md shadow-lg overflow-hidden relative">
                    {status === "idle" || status === "error" ? (
                        <div className="flex flex-col items-center justify-center space-y-6 py-10">
                            {/* Document Type Selector */}
                            <div className="w-full max-w-sm space-y-2">
                                <Label htmlFor="docType">Document Type</Label>
                                <select
                                    id="docType"
                                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                    value={docType}
                                    onChange={(e) => setDocType(e.target.value)}
                                    disabled={status !== "idle" && status !== "error"}
                                >
                                    <option value="PASSPORT">Passport</option>
                                    <option value="NATIONAL_ID">National ID</option>
                                    <option value="DRIVER_LICENSE">Driver's License</option>
                                </select>
                            </div>

                            {preview ? (
                                <div className="relative w-full max-w-sm aspect-[3/2] rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95">
                                    <Image src={preview} alt="Preview" fill className="object-cover" />
                                    <button onClick={clearFile} className="absolute top-4 right-4 h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-zinc-100">
                                        <X size={20} className="text-zinc-900" />
                                    </button>
                                </div>
                            ) : (
                                <Label htmlFor="doc-upload" className="cursor-pointer group flex flex-col items-center space-y-4">
                                    <div className="h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                        <Upload size={32} />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-xl">Click to select file</p>
                                        <p className="text-sm text-zinc-500">Supports JPG, PNG, WEBP (Max 10MB)</p>
                                    </div>
                                    <input id="doc-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </Label>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            {preview && (
                                <Button className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl" onClick={handleUpload}>
                                    Submit for Verification
                                </Button>
                            )}
                        </div>
                    ) : status === "uploading" || status === "verifying" ? (
                        <div className="flex flex-col items-center justify-center space-y-8 py-20 text-center">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full border-4 border-zinc-100 dark:border-zinc-800" />
                                <div className="h-24 w-24 rounded-full border-4 border-blue-600 border-t-transparent animate-spin absolute top-0" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ShieldCheck className="text-blue-600" size={32} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">{status === "uploading" ? "Uploading Document..." : "AI Verification in Progress..."}</h2>
                                <p className="text-zinc-500">{status === "uploading" ? "Securing your data with AES-256 encryption." : "Extracting fields and validating security features."}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-8 py-10 animate-in fade-in slide-in-from-bottom-4">
                            <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle2 size={40} />
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-black">Verification Successful!</h2>
                                <p className="text-zinc-500">Your {result?.type || "document"} has been added to your wallet.</p>
                            </div>

                            <div className="w-full grid grid-cols-2 gap-4">
                                <Card className="p-4 bg-zinc-50 dark:bg-zinc-900 border-0">
                                    <p className="text-[10px] font-black uppercase text-zinc-400">Issuer</p>
                                    <p className="font-bold">{result?.issuerCountry || "Unknown"}</p>
                                </Card>
                                <Card className="p-4 bg-zinc-50 dark:bg-zinc-900 border-0">
                                    <p className="text-[10px] font-black uppercase text-zinc-400">Status</p>
                                    <p className="font-bold text-green-600">{result?.status || "VERIFIED"}</p>
                                </Card>
                            </div>

                            <Button className="w-full h-14 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 text-white font-bold" onClick={() => router.push("/dashboard/user")}>
                                Back to Wallet
                            </Button>
                        </div>
                    )}
                </Card>

                <section className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-6 flex gap-4 items-start">
                    <ShieldCheck className="text-blue-600 shrink-0" size={24} />
                    <div className="space-y-1">
                        <p className="font-bold text-sm uppercase tracking-widest">Privacy Guarantee</p>
                        <p className="text-sm text-zinc-500">All documents are encrypted before storage. We use industry-standard Regula AI for document analysis without storing your permanent biometrics.</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
