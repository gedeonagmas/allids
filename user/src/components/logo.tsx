
'use client'
import React from "react";
import Link from 'next/link';
import { ShieldCheck } from "lucide-react";
import { useConfig } from "@/hooks/use-config";
import { useMenuHoverConfig } from "@/hooks/use-menu-hover";
import { useMediaQuery } from "@/hooks/use-media-query";

const Logo = () => {
    const [config] = useConfig()
    const [hoverConfig] = useMenuHoverConfig();
    const { hovered } = hoverConfig
    const isDesktop = useMediaQuery('(min-width: 1280px)');

    const BrandLogo = () => (
        <div className="flex gap-2 items-center">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <ShieldCheck size={20} />
            </div>
            {(!config?.collapsed || hovered) && (
                <h1 className="text-xl font-bold text-default-900 tracking-tighter">
                    ALLIDS
                </h1>
            )}
        </div>
    )

    if (config.sidebar === 'two-column' || !isDesktop) return null

    return (
        <Link href="/dashboard/user" className="flex gap-2 items-center">
            <BrandLogo />
        </Link>
    );
};

export default Logo;
