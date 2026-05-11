
"use client";

import React from 'react'
import HeaderContent from './header-content'
import ProfileInfo from './profile-info'
import ThemeSwitcher from './theme-switcher'
import { SidebarToggle } from '@/components/partials/sidebar/sidebar-toggle'
import { SheetMenu } from '@/components/partials/sidebar/menu/sheet-menu'
import HeaderLogo from "./header-logo"
import { Icon } from "@/components/ui/icon"


const DashCodeHeader = () => {
    return (
        <HeaderContent>
            <div className=' flex gap-3 items-center'>
                <HeaderLogo />
                <SidebarToggle />
                <SheetMenu />
                
                {/* Professional Promotion Text - Gray Themed */}
                <div className="hidden lg:flex items-center gap-3 ml-6">
                    <div className="h-8 w-8 rounded-lg bg-default-100 flex items-center justify-center text-default-600 shrink-0">
                        <Icon icon="heroicons:sparkles" className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-default-700 leading-none">Security Alert: Digital Identity Guard is Active</p>
                        <p className="text-[10px] text-default-500 font-medium mt-1 uppercase tracking-wider">Protect your assets and secure your data with Allids.one premium protection</p>
                    </div>
                </div>
            </div>
            <div className="nav-tools flex items-center  md:gap-4 gap-3">
                <ThemeSwitcher />
                <ProfileInfo />
            </div>
        </HeaderContent>
    )
}

export default DashCodeHeader