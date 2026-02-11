"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    FileText,
    Shield
} from "lucide-react";

export default function DocumentDetailPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const documentId = params.id as string;

    useEffect(() => {
        if (!isAuthLoading && (!user || user.role !== 'USER')) {
            router.push("/");
        }
    }, [user, isAuthLoading, router]);

    const { data: document, isLoading, error } = useQuery({
        queryKey: ["document", documentId],
        queryFn: async () => {
            const res = await api.get(`/documents/${documentId}`);
            return res.data;
        },
        enabled: !!user && user.role === 'USER' && !!documentId,
    });

    if (isAuthLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="text-center space-y-4">
                    <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-zinc-500">Loading document details...</p>
                </div>
            </div>
        );
    }

    if (error || !document) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
                <Card className="max-w-md w-full p-8 text-center space-y-4">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="text-red-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold">Document Not Found</h2>
                    <p className="text-zinc-500">This document may have been deleted or you don't have permission to view it.</p>
                    <Button onClick={() => router.push("/dashboard/user")} className="w-full">
                        Back to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col p-6 py-12">
            <div className="max-w-5xl mx-auto w-full space-y-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2" size={18} /> Back to Wallet
                </Button>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black tracking-tight">{document.type.replace(/_/g, ' ')}</h1>
                            {document.status === 'VERIFIED' ? (
                                <Badge className="bg-green-100 text-green-700 border-0 hover:bg-green-100">
                                    <CheckCircle2 size={14} className="mr-1" />
                                    VERIFIED
                                </Badge>
                            ) : document.status === 'REJECTED' ? (
                                <Badge className="bg-red-100 text-red-700 border-0 hover:bg-red-100">
                                    <AlertCircle size={14} className="mr-1" />
                                    REJECTED
                                </Badge>
                            ) : (
                                <Badge variant="secondary">{document.status}</Badge>
                            )}
                        </div>
                        <p className="text-zinc-500 text-lg">Complete document information</p>
                    </div>
                </div>

                {/* Complete Document Table */}
                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <FileText size={18} />
                        <h3 className="font-bold text-sm uppercase tracking-wider">All Document Data</h3>
                    </div>

                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {/* Core Properties Header */}
                                <tr className="bg-zinc-100 dark:bg-zinc-800">
                                    <td colSpan={2} className="px-4 py-3 font-bold text-xs uppercase tracking-wider">
                                        Core Properties
                                    </td>
                                </tr>
                                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                    <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 w-1/3">Document ID</td>
                                    <td className="px-4 py-3 font-mono text-xs break-all">{document.id}</td>
                                </tr>
                                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                    <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">User ID</td>
                                    <td className="px-4 py-3 font-mono text-xs break-all">{document.userId}</td>
                                </tr>
                                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                    <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Document Type</td>
                                    <td className="px-4 py-3">{document.type}</td>
                                </tr>
                                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                    <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={document.status === 'VERIFIED' ? 'default' : 'secondary'}>
                                            {document.status}
                                        </Badge>
                                    </td>
                                </tr>
                                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                    <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Issuer Country</td>
                                    <td className="px-4 py-3">{document.issuerCountry || 'Not specified'}</td>
                                </tr>
                                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                    <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Encrypted File Path</td>
                                    <td className="px-4 py-3 font-mono text-xs break-all">{document.encryptedFilePath}</td>
                                </tr>
                                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                    <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Expiration Date</td>
                                    <td className="px-4 py-3">
                                        {document.expiredDate
                                            ? new Date(document.expiredDate).toLocaleString()
                                            : 'No expiration'}
                                    </td>
                                </tr>

                                {/* Timestamps Header */}
                                <tr className="bg-zinc-100 dark:bg-zinc-800">
                                    <td colSpan={2} className="px-4 py-3 font-bold text-xs uppercase tracking-wider">
                                        Timestamps
                                    </td>
                                </tr>
                                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                    <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Created At</td>
                                    <td className="px-4 py-3 font-mono text-xs">{new Date(document.createdAt).toLocaleString()}</td>
                                </tr>
                                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                    <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Updated At</td>
                                    <td className="px-4 py-3 font-mono text-xs">{new Date(document.updatedAt).toLocaleString()}</td>
                                </tr>

                                {/* Document Fields */}
                                {document.documentFields && document.documentFields.length > 0 && (
                                    <>
                                        <tr className="bg-zinc-100 dark:bg-zinc-800">
                                            <td colSpan={2} className="px-4 py-3 font-bold text-xs uppercase tracking-wider">
                                                Document Fields ({document.documentFields.length})
                                            </td>
                                        </tr>
                                        {document.documentFields.map((field: any, index: number) => (
                                            <React.Fragment key={field.id}>
                                                <tr className="bg-zinc-50 dark:bg-zinc-900">
                                                    <td colSpan={2} className="px-4 py-2 text-xs font-semibold">
                                                        Field #{index + 1}
                                                    </td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                    <td className="px-6 py-2 font-medium text-zinc-600 dark:text-zinc-400 text-sm">Field ID</td>
                                                    <td className="px-6 py-2 font-mono text-xs break-all">{field.id}</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                    <td className="px-6 py-2 font-medium text-zinc-600 dark:text-zinc-400 text-sm">Field Key</td>
                                                    <td className="px-6 py-2">{field.fieldKey}</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                    <td className="px-6 py-2 font-medium text-zinc-600 dark:text-zinc-400 text-sm">Field Value</td>
                                                    <td className="px-6 py-2 font-mono text-xs break-all">{field.fieldValue || field.value || 'N/A'}</td>
                                                </tr>
                                                {field.documentId && (
                                                    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                        <td className="px-6 py-2 font-medium text-zinc-600 dark:text-zinc-400 text-sm">Document ID</td>
                                                        <td className="px-6 py-2 font-mono text-xs break-all">{field.documentId}</td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </>
                                )}

                                {/* Extracted Fields */}
                                {document.extractedFields && Object.keys(document.extractedFields).length > 0 && (
                                    <>
                                        <tr className="bg-zinc-100 dark:bg-zinc-800">
                                            <td colSpan={2} className="px-4 py-3 font-bold text-xs uppercase tracking-wider">
                                                Extracted Fields ({Object.keys(document.extractedFields).length})
                                            </td>
                                        </tr>
                                        {Object.entries(document.extractedFields).map(([key, value]: [string, any]) => (
                                            <tr key={key} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">{key.replace(/_/g, ' ')}</td>
                                                <td className="px-4 py-3">
                                                    {typeof value === 'object' ? (
                                                        Array.isArray(value) ? (
                                                            <div className="space-y-2">
                                                                {value.map((item: any, idx: number) => (
                                                                    <div key={idx} className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded border border-zinc-200 dark:border-zinc-800">
                                                                        {typeof item === 'object' ? (
                                                                            <div className="space-y-1">
                                                                                {Object.entries(item).map(([k, v]: [string, any]) => (
                                                                                    <div key={k} className="flex justify-between text-xs">
                                                                                        <span className="font-medium text-zinc-500">{k}:</span>
                                                                                        <span className="font-mono ml-2">{String(v)}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <span className="font-mono text-xs">{String(item)}</span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded border border-zinc-200 dark:border-zinc-800 space-y-1">
                                                                {Object.entries(value).map(([k, v]: [string, any]) => (
                                                                    <div key={k} className="flex justify-between text-xs">
                                                                        <span className="font-medium text-zinc-500">{k}:</span>
                                                                        <span className="font-mono ml-2">{String(v)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )
                                                    ) : (
                                                        <span className="font-mono text-xs">{String(value)}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                )}

                                {/* Permission Grants */}
                                {document.permissionGrants && document.permissionGrants.length > 0 && (
                                    <>
                                        <tr className="bg-zinc-100 dark:bg-zinc-800">
                                            <td colSpan={2} className="px-4 py-3 font-bold text-xs uppercase tracking-wider">
                                                Permission Grants ({document.permissionGrants.length})
                                            </td>
                                        </tr>
                                        {document.permissionGrants.map((grant: any, index: number) => (
                                            <React.Fragment key={grant.id}>
                                                <tr className="bg-zinc-50 dark:bg-zinc-900">
                                                    <td colSpan={2} className="px-4 py-2 text-xs font-semibold">
                                                        Grant #{index + 1}
                                                    </td>
                                                </tr>
                                                {Object.entries(grant).map(([key, value]: [string, any]) => (
                                                    <tr key={key} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                        <td className="px-6 py-2 font-medium text-zinc-600 dark:text-zinc-400 text-sm capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </td>
                                                        <td className="px-6 py-2 font-mono text-xs break-all">
                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </>
                                )}

                                {/* User Info */}
                                {document.user && (
                                    <>
                                        <tr className="bg-zinc-100 dark:bg-zinc-800">
                                            <td colSpan={2} className="px-4 py-3 font-bold text-xs uppercase tracking-wider">
                                                User Information
                                            </td>
                                        </tr>
                                        {Object.entries(document.user).map(([key, value]: [string, any]) => (
                                            <tr key={key} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs break-all">
                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                )}

                                {/* Additional Properties */}
                                {Object.entries(document)
                                    .filter(([key]) =>
                                        !['id', 'userId', 'type', 'status', 'createdAt', 'updatedAt', 'expiredDate',
                                            'issuerCountry', 'encryptedFilePath', 'documentFields', 'permissionGrants',
                                            'user', 'extractedFields'].includes(key)
                                    ).length > 0 && (
                                        <>
                                            <tr className="bg-zinc-100 dark:bg-zinc-800">
                                                <td colSpan={2} className="px-4 py-3 font-bold text-xs uppercase tracking-wider">
                                                    Additional Properties
                                                </td>
                                            </tr>
                                            {Object.entries(document)
                                                .filter(([key]) =>
                                                    !['id', 'userId', 'type', 'status', 'createdAt', 'updatedAt', 'expiredDate',
                                                        'issuerCountry', 'encryptedFilePath', 'documentFields', 'permissionGrants',
                                                        'user', 'extractedFields'].includes(key)
                                                )
                                                .map(([key, value]) => (
                                                    <tr key={key} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                        <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {typeof value === 'object' && value !== null ? (
                                                                Array.isArray(value) ? (
                                                                    <div className="space-y-2">
                                                                        {value.map((item: any, idx: number) => (
                                                                            <div key={idx} className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded border border-zinc-200 dark:border-zinc-800">
                                                                                {typeof item === 'object' && item !== null ? (
                                                                                    <div className="space-y-1">
                                                                                        {Object.entries(item).map(([k, v]: [string, any]) => (
                                                                                            <div key={k} className="flex justify-between text-xs">
                                                                                                <span className="font-medium text-zinc-500">{k}:</span>
                                                                                                <span className="font-mono ml-2 break-all">{String(v)}</span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className="font-mono text-xs">{String(item)}</span>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded border border-zinc-200 dark:border-zinc-800 space-y-1">
                                                                        {Object.entries(value).map(([k, v]: [string, any]) => (
                                                                            <div key={k} className="flex justify-between text-xs">
                                                                                <span className="font-medium text-zinc-500">{k}:</span>
                                                                                <span className="font-mono ml-2 break-all">{String(v)}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <span className="font-mono text-xs">{String(value)}</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </>
                                    )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Security Notice */}
                <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex gap-4 items-start">
                        <Shield className="text-blue-600 shrink-0 mt-1" size={24} />
                        <div className="space-y-1">
                            <p className="font-bold text-sm">Verified by Regula AI</p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                This document has been verified using advanced AI-powered document authentication technology.
                                All sensitive data is encrypted at rest using AES-256 encryption and stored securely.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
