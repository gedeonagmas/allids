
"use client"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  ColumnDef,
} from "@tanstack/react-table"
import { Eye, Shield, Key } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils";

export type ActivityDataProps = {
  id: string | number;
  org: {
    name: string;
    image: string;
  };
  date: string;
  purpose: string;
  accessType: "full" | "preview" | "metadata";
  status: "active" | "expired" | "revoked";
  action: React.ReactNode;
}
export const columns: ColumnDef<ActivityDataProps>[] = [
  {
    accessorKey: "org",
    header: "Requested By",
    cell: ({ row }) => {
      const org = row.original.org;
      return (
        <div className="flex gap-2 items-center">
          <Avatar className="w-6 h-6 rounded">
            <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-bold">ALL</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-default-900 whitespace-nowrap">
            {org?.name ?? "Partner Service"}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: "date",
    header: "Timestamp",
    cell: ({ row }) => <span className="text-xs text-default-600 whitespace-nowrap">{row.getValue("date")}</span>,
  },
  {
    accessorKey: "purpose",
    header: "Purpose / Scopes",
    cell: ({ row }) => <span className="text-xs text-default-600 truncate max-w-[200px] inline-block">{row.getValue("purpose")}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusColors: Record<string, string> = {
        active: "bg-success text-white",
        expired: "bg-default-200 text-default-700",
        revoked: "bg-destructive text-white"
      };
      const status = row.getValue<string>("status");
      const statusStyles = statusColors[status] || "bg-default-100";
      return (
        <Badge className={cn("rounded px-3 py-1 h-7 text-xs font-bold capitalize border-none", statusStyles)}>
          {status}
        </Badge>
      );
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="icon" className="w-9 h-9 border-default-200 text-default-600 hover:bg-primary hover:text-white transition-all shadow-sm">
            <Eye className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" className="w-9 h-9 border-default-200 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm">
            <Shield className="w-5 h-5" />
          </Button>
        </div>
      )
    }
  }
]