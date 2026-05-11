
"use client";

import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft,
  ChevronRight,
  Plus, 
  Minus,
  Activity, 
  Clock, 
  ShieldCheck, 
  Wallet, 
  Bell,
  ArrowUpRight,
  TrendingUp,
  MapPin
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import DealDistributionsChart from "./components/deal-distributions-chart";
import TransactionsTable from "./components/transactions";
import VMap from "./components/vectore-map";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function UserDashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [docsRes, walletRes, historyRes] = await Promise.all([
        api.get("/documents"),
        api.get("/documents/wallet"),
        api.get("/verification/history")
      ]);
      return {
        totalDocs: docsRes.data.length,
        verifiedDocs: walletRes.data.length,
        pendingDocs: docsRes.data.filter((d: any) => d.status === 'PENDING').length,
        recentHistory: historyRes.data?.slice(0, 5) || []
      };
    }
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-default-900">Dashboard</h1>
          <p className="text-sm text-default-600">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" color="primary" className="h-10" asChild>
            <Link href="/dashboard/user/access">
              <Activity className="w-4 h-4 mr-2" />
              Access Requests
            </Link>
          </Button>
          <Button color="primary" className="h-10" asChild>
            <Link href="/dashboard/user/upload">
              <Plus className="w-4 h-4 mr-2" />
              Register ID
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Identity Trust Score", value: "98.2%", icon: ShieldCheck, color: "primary", trend: "+0.5%" },
          { label: "Verified Credentials", value: stats?.verifiedDocs || "12", icon: Wallet, color: "success", trend: "+2" },
          { label: "Data Access Requests", value: "24", icon: Activity, color: "info", trend: "+5" },
          { label: "Active Sessions", value: "03", icon: Clock, color: "warning", trend: "Secured" },
        ].map((item, index) => (
          <Card key={index} className="overflow-hidden border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-default-600 uppercase tracking-wider">{item.label}</p>
                  <h3 className="text-2xl font-bold mt-1 text-default-900">{item.value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-${item.color}/10 text-${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-xs">
                <span className={`flex items-center font-semibold text-${item.color}`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {item.trend}
                </span>
                <span className="ml-2 text-default-400">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 border-none shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-default-900">Activity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4 pt-0">
            <DealDistributionsChart height={350} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-default-900">Access Request Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative">
            <div className="h-[350px] w-full">
              <VMap height={350} />
              
              {/* Refined Floating Info Box */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-default-900/90 backdrop-blur-md p-3 rounded-xl border border-default-100 shadow-lg flex items-center gap-3 z-30 transform hover:-translate-y-1 transition-transform cursor-default">
                 <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-5 h-5" />
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-tight">Latest Verification</p>
                    <p className="text-sm font-bold text-default-900 truncate">New York, USA</p>
                 </div>
                 <Badge className="ml-auto text-[9px] font-bold bg-success/5 text-success border-success/20">Verified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Side-by-Side Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Table */}
        <Card className="lg:col-span-8 border-none shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <TransactionsTable />
        </Card>

        {/* Small Table / Quick Actions with Pagination */}
        <Card className="lg:col-span-4 border-none shadow-sm flex flex-col h-full min-h-[500px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-default-900">Recent Access Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
             <div className="divide-y divide-default-50 flex-1">
                {stats?.recentHistory && stats.recentHistory.length > 0 ? (
                  stats.recentHistory.map((item: any, i: number) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-default-50 transition-all cursor-default group">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-default-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <ShieldCheck className="w-5 h-5 text-default-500 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-default-900 leading-none mb-1">{item.orgName || "Partner App"}</p>
                          <p className="text-[11px] text-default-500 font-medium truncate max-w-[150px]">{item.purpose}</p>
                        </div>
                      </div>
                      <Badge className="text-[9px] font-bold px-2 py-0 h-5 border-default-200">ACTIVE</Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 text-default-400 space-y-2 opacity-60">
                    <Bell className="w-8 h-8" />
                    <p className="text-xs font-medium">No active requests</p>
                  </div>
                )}
             </div>
             
             {/* Pagination for Access Requests - Exact Match with Transactions Style */}
             <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-default-100 bg-default-50/30 rounded-b-xl">
                <div className="flex-1 text-xs font-bold text-default-500 uppercase tracking-widest">
                   Page 1 of 1
                </div>
                <div className="flex items-center gap-1 md:gap-2 flex-none">
                   <Button
                      variant="outline"
                      size="icon"
                      disabled
                      className='w-8 h-8 bg-white border-default-200'
                   >
                      <ChevronLeft className='w-4 h-4' />
                   </Button>
                   
                   <Button
                      size="icon"
                      className="w-8 h-8 bg-default text-white hover:bg-default/90"
                   >
                      1
                   </Button>

                   <Button
                      variant="outline"
                      size="icon"
                      disabled
                      className='w-8 h-8 bg-white border-default-200'
                   >
                      <ChevronRight className='w-4 h-4' />
                   </Button>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
