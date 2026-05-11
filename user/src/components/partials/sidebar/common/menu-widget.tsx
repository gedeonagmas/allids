'use client'
import { Button } from '@/components/ui/button'
import { useConfig } from '@/hooks/use-config'
import Image from 'next/image'
import React from 'react'

const MenuWidget = () => {
    const [config] = useConfig();
    if (config.sidebar === 'compact') return null
    return (
        <div className="bg-default-100 mb-6 mt-6 p-4 relative text-center rounded-xl border border-default-200">
            <Image 
                className="mx-auto relative -mt-8 mb-2 drop-shadow-sm" 
                alt="Allids Badge" 
                src="/images/allids-badge.png" 
                priority 
                width={80} 
                height={80} 
            />
            <div className="max-w-[160px] mx-auto">
                <div className="text-sm font-bold leading-tight text-default-900">Allids.one Pro</div>
                <div className="text-[10px] font-medium text-default-600 mt-1 leading-tight">
                    Secure identity & advanced protection
                </div>
            </div>
            <div className="mt-3">
                <Button 
                    size="sm" 
                    fullWidth 
                    color="primary"
                    className='h-8 text-[11px] font-bold uppercase tracking-wider'
                >
                    Upgrade Now
                </Button>
            </div>
        </div>
    )
}

export default MenuWidget