"use client";

import React from 'react'
import { Ellipsis } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menus";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "@/components/ui/tooltip";
import { useConfig } from "@/hooks/use-config";
import MenuLabel from "../common/menu-label";
import MenuItem from "../common/menu-item";
import { CollapseMenuButton } from "../common/collapse-menu-button";
import SearchBar from '@/components/partials/sidebar/common/search-bar'
import { useParams } from 'next/navigation'
import Logo from '@/components/logo';
import SidebarHoverToggle from '@/components/partials/sidebar/sidebar-hover-toggle';
import { useMenuHoverConfig } from '@/hooks/use-menu-hover';
import { useMediaQuery } from '@/hooks/use-media-query';
import MenuWidget from '../common/menu-widget';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/auth-context';


export function MenuClassic({ }) {
    const pathname = usePathname();
    const params = useParams<{ locale: string; }>();
    const direction = 'ltr';

    const isDesktop = useMediaQuery('(min-width: 1280px)')
    const { logout } = useAuth();

    const menuList = getMenuList(pathname, {});
    const [config, setConfig] = useConfig()
    const collapsed = config.collapsed
    const [hoverConfig] = useMenuHoverConfig();
    const { hovered } = hoverConfig;

    const scrollableNodeRef = React.useRef<HTMLDivElement>(null);
    const [scroll, setScroll] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            if (scrollableNodeRef.current && scrollableNodeRef.current.scrollTop > 0) {
                setScroll(true);
            } else {
                setScroll(false);
            }
        };
        scrollableNodeRef.current?.addEventListener("scroll", handleScroll);
    }, [scrollableNodeRef]);

    return (
        <>
            {isDesktop && (
                <div className="flex items-center justify-between  px-4 py-4">
                    <Logo />
                    <SidebarHoverToggle />
                </div>
            )}

            <ScrollArea className="[&>div>div[style]]:block!" dir={direction}>

                <nav className="mt-8 h-full w-full">
                    <ul className=" h-full flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-4">
                        {menuList?.map(({ groupLabel, menus }, index) => (
                            <li className={cn("w-full", groupLabel ? "" : "")} key={index}>

                                {menus.map(
                                    ({ href, label, icon, active, id, submenus }, index) =>
                                        submenus.length === 0 ? (
                                            <div className="w-full mb-2 last:mb-0" key={index}>
                                                <TooltipProvider disableHoverableContent>
                                                    <Tooltip delayDuration={100}>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <MenuItem label={label} icon={icon} href={href} active={active} id={id} collapsed={collapsed} />
                                                            </div>
                                                        </TooltipTrigger>
                                                        {collapsed && (
                                                            <TooltipContent side="right">
                                                                {label}
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        ) : (
                                            <div className="w-full mb-2" key={index}>
                                                <CollapseMenuButton
                                                    icon={icon}
                                                    label={label}
                                                    active={active}
                                                    submenus={submenus}
                                                    collapsed={collapsed}
                                                    id={id}
                                                />
                                            </div>
                                        )
                                )}

                            </li>
                        ))}
                        <li className="w-full mt-auto">
                            {(!collapsed || hovered) && (
                                <div className="px-4">
                                    <MenuWidget />
                                </div>
                            )}
                            <div className="border-t border-default-200">
                                <button
                                    onClick={() => logout()}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 w-full text-default-600 hover:text-primary transition-all duration-200 rounded-md hover:bg-primary/5 cursor-pointer",
                                        {
                                            "justify-center px-0": collapsed && !hovered,
                                        }
                                    )}
                                >
                                    <LogOut className="h-5 w-5 min-w-[20px]" />
                                    {(!collapsed || hovered) && (
                                        <span className="text-sm font-medium">Logout</span>
                                    )}
                                </button>
                            </div>
                        </li>
                    </ul>
                </nav>
            </ScrollArea>
        </>
    );
}
