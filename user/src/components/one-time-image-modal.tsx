"use client";

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ShieldCheck, XCircle, CheckCircle2 } from "lucide-react";
import { api } from '@/lib/api';

interface OneTimeImageModalProps {
    grantId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function OneTimeImageModal({ grantId, isOpen, onClose }: OneTimeImageModalProps) {
    const [timeLeft, setTimeLeft] = useState(5); // 5 seconds countdown
    const [grantData, setGrantData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && grantId) {
            fetchGrantData();
            setTimeLeft(5);
        }
    }, [isOpen, grantId]);

    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    // Separate effect for closing when time is up
    useEffect(() => {
        if (isOpen && timeLeft === 0) {
            onClose();
        }
    }, [timeLeft, isOpen, onClose]);

    const fetchGrantData = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/verification/grant/${grantId}`);
            setGrantData(res.data);
        } catch (error) {
            console.error('Failed to fetch grant data:', error);
            // Use setTimeout to skip the current render cycle if needed
            setTimeout(() => onClose(), 0);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!grantId) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] border-slate-200 shadow-2xl bg-white text-slate-900 overflow-hidden p-0 gap-0">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                    <div
                        className="h-full bg-blue-600 transition-all duration-1000 ease-linear"
                        style={{ width: `${(timeLeft / 5) * 100}%` }}
                    />
                </div>

                <DialogHeader className="p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600/20 rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold">Secure Document View</DialogTitle>
                                <p className="text-xs text-zinc-400">One-time access granted by user</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-50 border-slate-200 !text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                            <Clock size={14} className="animate-pulse text-blue-500" />
                            <span className="font-mono text-sm font-black">{formatTime(timeLeft)}</span>
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="relative aspect-[16/10] bg-slate-50 group">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : grantData?.image ? (
                        <img
                            src={grantData.image}
                            alt="Document"
                            className="w-full h-full object-contain select-none"
                            onContextMenu={(e) => e.preventDefault()}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <XCircle size={48} className="opacity-20" />
                            <p className="text-sm font-medium">Image could not be retrieved or has expired.</p>
                        </div>
                    )}

                    {/* Security Overlay */}
                    <div className="absolute inset-0 pointer-events-none border-[20px] border-black/5 flex items-center justify-center overflow-hidden opacity-5 text-slate-900 whitespace-nowrap select-none">
                        <p className="text-8xl font-black rotate-[-30deg] uppercase tracking-widest">
                            CONFIDENTIAL • ALLIDS • {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-6 border-t border-slate-100 flex sm:flex-row flex-col gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-500 font-bold"
                    >
                        Close View
                    </Button>
                    <Button
                        onClick={onClose}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/20 gap-2"
                    >
                        <CheckCircle2 size={18} />
                        Done & Log Access
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
