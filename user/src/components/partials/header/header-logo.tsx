
'use client'
import React from 'react'
import Link from 'next/link'
import { ShieldCheck } from "lucide-react"
import { useConfig } from '@/hooks/use-config'
import { useMediaQuery } from '@/hooks/use-media-query'

const HeaderLogo = () => {
    const [config] = useConfig();
    const isDesktop = useMediaQuery('(min-width: 1280px)');

    const Logo = () => (
        <div className="flex gap-2 items-center">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <ShieldCheck size={20} />
            </div>
            <h1 className="text-xl font-bold text-default-900 lg:block hidden tracking-tighter">
                ALLIDS
            </h1>
        </div>
    )

    if (config.layout === 'horizontal') {
        return (
            <Link href="/dashboard/user">
                <Logo />
            </Link>
        )
    }

    if (!isDesktop) {
        return (
            <Link href="/dashboard/user">
                <Logo />
            </Link>
        )
    }

    return null;
}

export default HeaderLogo