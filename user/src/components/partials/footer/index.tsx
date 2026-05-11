
"use client";

import React from 'react'
import FooterContent from './footer-content'
import Link from "next/link"
import { Icon } from "@/components/ui/icon";
import { useAuth } from '@/context/auth-context'

const DashCodeFooter = () => {
    const { user } = useAuth();
    
    return (
        <FooterContent>
            <div className=' md:flex  justify-between text-default-600 hidden'>
                <div className="text-center md:ltr:text-start md:rtl:text-right text-sm">
                    COPYRIGHT &copy; {new Date().getFullYear()} ALLIDS, All rights Reserved
                </div>
                <div className="md:ltr:text-right md:rtl:text-end text-center text-sm">
                    Securing Identity Backbone
                </div>
            </div>
            <div className='flex md:hidden justify-around items-center'>
                <Link href="/dashboard/user/notifications" className="text-default-600">
                    <div className="flex flex-col items-center">
                        <Icon icon="heroicons-outline:bell" className="text-xl" />
                        <span className="block text-xs">Alerts</span>
                    </div>
                </Link>
                <Link
                    href="/dashboard/user/settings"
                    className="relative bg-card rounded-full h-[65px] w-[65px] -mt-[40px] flex justify-center items-center shadow-lg border-4 border-background"
                >
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0) || "U"}
                    </div>
                </Link>
                <Link href="/dashboard/user/wallet">
                    <div className="flex flex-col items-center text-default-600">
                        <Icon icon="heroicons-outline:credit-card" className="text-xl" />
                        <span className="block text-xs">Wallet</span>
                    </div>
                </Link>
            </div>
        </FooterContent>
    )
}

export default DashCodeFooter