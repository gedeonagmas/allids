
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import LayoutProvider from "@/providers/layout.provider";
import LayoutContentProvider from "@/providers/content.provider";
import DashCodeSidebar from '@/components/partials/sidebar'
import DashCodeFooter from '@/components/partials/footer'
import DashCodeHeader from '@/components/partials/header'
import ThemeCustomize from '@/components/partials/customizer'

export default function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    // Protected route check
    useEffect(() => {
        if (!isAuthLoading && (!user || user.role !== 'USER')) {
            router.push("/");
        }
    }, [user, isAuthLoading, router]);

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing Identity Backbone...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <LayoutProvider >
            <DashCodeHeader />
            <DashCodeSidebar />
            <LayoutContentProvider>
                <div className="p-6">
                    {children}
                </div>
            </LayoutContentProvider>
            <DashCodeFooter />
        </LayoutProvider>
    );
}
