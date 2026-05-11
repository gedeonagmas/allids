
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon"
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import Link from "next/link";

const ProfileInfo = () => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  return (
    <div className="block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor-pointer outline-none">
          <div className="flex items-center gap-2.5 text-default-800 border border-default-200 rounded-full py-1.5 px-2.5 hover:bg-default-50 hover:border-primary/30 transition-all shadow-sm group">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
               <Icon icon="heroicons:user-circle" className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start lg:flex hidden">
              <span className="text-[11px] font-bold text-default-900 leading-tight capitalize">{user.name || "Identity Holder"}</span>
            </div>
            <span className="text-base lg:inline-block hidden">
              <Icon icon="heroicons-outline:chevron-down" className="w-4 h-4 text-default-400 group-hover:text-primary transition-colors"></Icon>
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-0 shadow-xl border-default-100" align="end">
          <DropdownMenuLabel className="flex gap-3 items-center p-4 border-b border-default-50">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
               <Icon icon="heroicons:user-circle" className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-default-500 mb-0.5 tracking-tight">
                {user.phone || "+251 954 104 637"}
              </span>
              <span className="text-sm font-extrabold text-default-900 capitalize tracking-tight">
                {user.name || "Identity Holder"}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <Link href="/dashboard/user/settings" className="cursor-pointer">
                <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-2 cursor-pointer">
                  <Icon icon="heroicons:user" className="w-4 h-4 text-default-500" />
                  Identity Profile
                </DropdownMenuItem>
            </Link>
            <Link href="/dashboard/user/settings" className="cursor-pointer">
                <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-2 cursor-pointer">
                  <Icon icon="heroicons:lock-closed" className="w-4 h-4 text-default-500" />
                  Security Hub
                </DropdownMenuItem>
            </Link>
            <Link href="/dashboard/user/settings" className="cursor-pointer">
                <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-2 cursor-pointer">
                  <Icon icon="heroicons:eye-slash" className="w-4 h-4 text-default-500" />
                  Privacy Rules
                </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="mb-0 dark:bg-background" />
          <DropdownMenuItem
            className="flex items-center gap-2 text-sm font-medium text-destructive capitalize my-1 px-3 py-2 cursor-pointer"
            onClick={() => logout()}
          >
            <Icon icon="heroicons:power" className="w-4 h-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
export default ProfileInfo;
