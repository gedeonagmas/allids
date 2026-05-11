
"use client";

import React from 'react'
import Logo from '@/components/logo';
import SidebarHoverToggle from '@/components/partials/sidebar/sidebar-hover-toggle';
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
import MenuWidget from '../common/menu-widget';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

// for dnd 
import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    closestCenter,
    useSensor,
    type DragEndEvent,
    type UniqueIdentifier,
    useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useParams } from 'next/navigation'

export function MenuDragAble() {
    const pathname = usePathname();
    const menuList = getMenuList(pathname, {});
    const [config, setConfig] = useConfig()
    const collapsed = config.collapsed
    const { logout } = useAuth();

    const params = useParams<{ locale: string; }>();
    const direction = "ltr";
    // for dnd 
    // reorder rows after drag & drop
    const [data, setData] = React.useState(menuList);

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => data.flatMap(group => group.menus.map(menu => menu.id)), [data]

    );
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            setData((data) => {

                const dataIds = data.flatMap(group => group.menus.map(menu => menu.id));

                const oldIndex = dataIds.indexOf(active.id as string);
                const newIndex = dataIds.indexOf(over.id as string);

                if (oldIndex !== -1 && newIndex !== -1) {
                    // Flatten data
                    const flattenedMenus = data.flatMap(group => group.menus);
                    const updatedMenus = arrayMove(flattenedMenus, oldIndex, newIndex);

                    // Reconstruct the data structure
                    let currentIndex = 0;
                    const updatedData = data.map(group => {
                        const groupMenusCount = group.menus.length;
                        const updatedGroupMenus = updatedMenus.slice(currentIndex, currentIndex + groupMenusCount);
                        currentIndex += groupMenusCount;
                        return { ...group, menus: updatedGroupMenus };
                    });

                    return updatedData;
                }
                return data;
            });
        }
    }

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    );

    return (

        <>
            <div className="flex items-center justify-between  px-4 py-4">
                <Logo />
                <SidebarHoverToggle />
            </div>

            <ScrollArea className="[&>div>div[style]]:block!" dir={direction}>


                <DndContext
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                >
                    <nav className="h-full w-full">
                        <ul className="h-full flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-4">
                            {data?.map(({ groupLabel, menus }, index) => (
                                <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
                                    <SortableContext
                                        items={dataIds}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {menus.map(
                                            ({ href, label, icon, active, id, submenus }, index) =>
                                                submenus.length === 0 ? (
                                                    <div className="w-full" key={index}>
                                                        <TooltipProvider disableHoverableContent>
                                                            <Tooltip delayDuration={100}>
                                                                <TooltipTrigger asChild>

                                                                <MenuItem label={label} icon={icon} href={href} active={active} id={id} collapsed={collapsed} />
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
                                                    <div className="w-full" key={index}>
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
                                    </SortableContext>
                                </li>
                            ))}
                            <li className="w-full mt-auto">
                                {!collapsed && (
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
                                                "justify-center px-0": collapsed,
                                            }
                                        )}
                                    >
                                        <LogOut className="h-5 w-5 min-w-[20px]" />
                                        {!collapsed && (
                                            <span className="text-sm font-medium">Logout</span>
                                        )}
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </nav>
                </DndContext>
            </ScrollArea>
        </>
    );
}