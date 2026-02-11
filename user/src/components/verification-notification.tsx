"use client";

import React, { useEffect, useState } from 'react';
import { useSocket } from '@/context/socket-context';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, FileText, UserCheck } from "lucide-react";
import { toast } from 'sonner';

export function VerificationNotification() {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [request, setRequest] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userDocuments, setUserDocuments] = useState<any[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        if (!socket || !user || user.role !== 'USER') return;

        const handleRequest = (data: any) => {
            console.log('Received verification request:', data);
            setRequest(data.payload);
            setIsOpen(true);

            // Fetch user's documents of that type to allow selection
            fetchDocuments(data.payload.documentType, data.payload.accessType);
        };

        socket.on('verification_request', handleRequest);

        return () => {
            socket.off('verification_request', handleRequest);
        };
    }, [socket, user]);

    const fetchDocuments = async (docType: string, accessType: string) => {
        try {
            const res = await api.get('/documents');
            const filtered = res.data.filter((doc: any) => doc.type === docType);
            setUserDocuments(filtered);

            if (filtered.length > 0 && accessType === 'FULL_DOCUMENT') {
                // Fetch the image for preview
                const imageRes = await api.get(`/documents/${filtered[0].id}/image`);
                setPreviewImage(imageRes.data.image);
            }
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        }
    };

    const handleApprove = async () => {
        if (!request || userDocuments.length === 0) {
            toast.error("No valid document found to share.");
            return;
        }

        setIsLoading(true);
        try {
            // For now, take the first document of that type
            const documentId = userDocuments[0].id;

            await api.post('/verification/approve', {
                requestId: request.requestId,
                documentId: documentId,
            });

            toast.success("Identity shared successfully!");
            setIsOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to approve request.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeny = async () => {
        if (!request) return;

        setIsLoading(true);
        try {
            await api.post(`/verification/deny/${request.requestId}`);
            toast.info("Request denied.");
            setIsOpen(false);
        } catch (error: any) {
            toast.error("Failed to deny request.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!request) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px] border-primary/20 bg-background/95 backdrop-blur-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">Identity Request</DialogTitle>
                            <DialogDescription className="text-sm font-medium text-muted-foreground">
                                Outgoing request from {request.orgName}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Purpose</h4>
                        <p className="text-sm border p-3 rounded-lg bg-muted/30">{request.purpose}</p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Requested Access</h4>
                        <div className="flex items-center gap-2">
                            <Badge variant={request.accessType === 'FIELDS_ONLY' ? 'secondary' : 'destructive'} className="uppercase">
                                {request.accessType === 'FIELDS_ONLY' ? 'KYC Data' : 'Full Document View'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {request.accessType === 'FIELDS_ONLY' ? 'Fields only' : 'Visible for 5 minutes'}
                            </span>
                        </div>
                    </div>

                    {request.accessType === 'FIELDS_ONLY' && request.fields && request.fields.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Requested Fields</h4>
                            <div className="flex flex-wrap gap-2">
                                {request.fields.map((field: string) => (
                                    <Badge key={field} variant="outline" className="bg-primary/5">{field}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sharing Document</h4>
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium uppercase">{request.documentType.replace(/_/g, ' ')}</p>
                                {userDocuments.length > 0 ? (
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <UserCheck className="w-3 h-3" /> Ready to share
                                    </p>
                                ) : (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <ShieldAlert className="w-3 h-3" /> No matching document in wallet
                                    </p>
                                )}
                            </div>
                        </div>

                        {request?.accessType === 'FULL_DOCUMENT' && previewImage && (
                            <div className="mt-2 relative group">
                                <p className="text-[10px] text-muted-foreground mb-1 uppercase font-bold tracking-tight">Your Document Preview</p>
                                <div className="rounded-xl overflow-hidden border border-primary/20 bg-black aspect-[1.6/1] flex items-center justify-center relative">
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        className="max-h-full max-w-full object-contain"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                        <Badge variant="outline" className="text-white border-white/20 bg-black/40 backdrop-blur-sm text-[10px]">
                                            Secure Preview
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={handleDeny} disabled={isLoading} className="flex-1">
                        Reject
                    </Button>
                    <Button onClick={handleApprove} disabled={isLoading || userDocuments.length === 0} className="flex-1 shadow-lg shadow-primary/20">
                        {isLoading ? 'Processing...' : 'Approve & Share'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
