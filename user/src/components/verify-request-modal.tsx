"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserSearch, FileText, CheckCircle2 } from "lucide-react";
import { api } from '@/lib/api';
import { toast } from 'sonner';

const DOCUMENT_TYPES = [
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'NATIONAL_ID', label: 'National ID' },
    { value: 'DRIVERS_LICENSE', label: 'Driver\'s License' },
];

const COMMON_FIELDS = [
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'documentNumber', label: 'ID/Doc Number' },
    { value: 'dateOfExpiry', label: 'Expiry Date' },
    { value: 'dateOfBirth', label: 'Date of Birth' },
    { value: 'sex', label: 'Gender' },
    { value: 'nationality', label: 'Nationality' }
];

interface VerifyRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function VerifyRequestModal({ isOpen, onClose }: VerifyRequestModalProps) {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [documentType, setDocumentType] = useState('PASSPORT');
    const [accessType, setAccessType] = useState<'FIELDS_ONLY' | 'FULL_DOCUMENT'>('FIELDS_ONLY');
    const [purpose, setPurpose] = useState('');
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const resetForm = () => {
        setStep(1);
        setPhone('');
        setPurpose('');
        setSelectedFields([]);
        setIsLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const toggleField = (fieldValue: string) => {
        setSelectedFields(prev =>
            prev.includes(fieldValue) ? prev.filter(f => f !== fieldValue) : [...prev, fieldValue]
        );
    };

    const handleSubmit = async () => {
        if (!phone || !purpose) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (accessType === 'FIELDS_ONLY' && selectedFields.length === 0) {
            toast.error("Please select at least one field for KYC.");
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/verification/request', {
                phone,
                documentType,
                accessType,
                purpose,
                fields: accessType === 'FIELDS_ONLY' ? selectedFields : [],
            });

            toast.success("Verification request sent in real-time!");
            handleClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send request.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] border-blue-500/20 shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600/10 rounded-full">
                            <ShieldCheck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">New Verification</DialogTitle>
                            <DialogDescription>Request secure identity data from a user.</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* Step Indicators */}
                    <div className="flex items-center justify-between px-2">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                                    step >= s ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-400"
                                )}>
                                    {step > s ? <CheckCircle2 size={16} /> : s}
                                </div>
                                {s < 3 && <div className={cn("h-0.5 w-12 transition-colors", step > s ? "bg-blue-600" : "bg-zinc-100")} />}
                            </div>
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="phone">User's Phone Number (E.164)</Label>
                                <div className="relative">
                                    <UserSearch className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                    <Input
                                        id="phone"
                                        placeholder="+1234567890"
                                        className="pl-10"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="purpose">Request Purpose</Label>
                                <Input
                                    id="purpose"
                                    placeholder="e.g. Loan Application or Check-in"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label>Document Type</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {DOCUMENT_TYPES.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => setDocumentType(type.value)}
                                            className={cn(
                                                "p-3 text-xs font-bold border rounded-xl flex flex-col items-center gap-2 transition-all",
                                                documentType === type.value ? "border-blue-600 bg-blue-50 text-blue-600" : "hover:border-zinc-300"
                                            )}
                                        >
                                            <FileText size={20} />
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Access Type</Label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setAccessType('FIELDS_ONLY')}
                                        className={cn(
                                            "flex-1 p-3 text-xs font-bold border rounded-xl transition-all",
                                            accessType === 'FIELDS_ONLY' ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm" : "text-zinc-500"
                                        )}
                                    >
                                        KYC (Specific Fields)
                                    </button>
                                    <button
                                        onClick={() => setAccessType('FULL_DOCUMENT')}
                                        className={cn(
                                            "flex-1 p-3 text-xs font-bold border rounded-xl transition-all",
                                            accessType === 'FULL_DOCUMENT' ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm" : "text-zinc-500"
                                        )}
                                    >
                                        One-Time (Full Image)
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            {accessType === 'FIELDS_ONLY' ? (
                                <>
                                    <Label>Required Fields</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {COMMON_FIELDS.map(field => (
                                            <Badge
                                                key={field.value}
                                                variant={selectedFields.includes(field.value) ? 'default' : 'outline'}
                                                className="cursor-pointer px-3 py-1.5 transition-all text-xs"
                                                onClick={() => toggleField(field.value)}
                                            >
                                                {field.label}
                                            </Badge>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <ShieldCheck size={20} />
                                        <span className="font-bold">One-Time Image Access</span>
                                    </div>
                                    <p className="text-xs text-blue-600/80 leading-relaxed font-medium">
                                        You are requesting full image visibility of the user's document.
                                        Access will be granted for exactly <strong>5 minutes</strong> after the user approves.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2">
                    {step > 1 && (
                        <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={isLoading}>
                            Back
                        </Button>
                    )}
                    {step < 3 ? (
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => setStep(step + 1)}
                        >
                            Continue
                        </Button>
                    ) : (
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                            disabled={isLoading}
                            onClick={handleSubmit}
                        >
                            {isLoading ? "Sending..." : "Send Request"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
