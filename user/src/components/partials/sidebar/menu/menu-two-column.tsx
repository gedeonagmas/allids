
"use client";

import React from 'react'
import { usePathname } from "next/navigation";
import { getMenuList } from "@/lib/menus";

import IconNav from './icon-nav';
import SidebarNav from './sideabr-nav';


export function MenuTwoColumn() {
    const pathname = usePathname();
    const menuList = getMenuList(pathname, {});

    return (
        <>
            <IconNav menuList={menuList} />
            <SidebarNav menuList={menuList} />
        </>
    );
}
