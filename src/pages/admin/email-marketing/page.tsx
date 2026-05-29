import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Mail, Send, Users, BarChart3, Plus, RefreshCw,
  FileText, Clock, CheckCircle2, XCircle, Eye, Trash2
} from "lucide-react";

export default function AdminEmailMarketingPage() {
  const [refreshing, setRefreshing] = useState(false);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Email Marketing</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create and manage email campaigns for your platform users</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
            <Plus className="h-4 w-4 mr-1.5" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Send className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">0</p>
                <p className="text-xs text-slate-500 font-medium">Campaigns Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-700">0</p>
                <p className="text-xs text-slate-500 font-medium">Total Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">0%</p>
                <p className="text-xs text-slate-500 font-medium">Avg Open Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">0%</p>
                <p className="text-xs text-slate-500 font-medium">Avg Click Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      <Card className="border-slate-200/80">
        <CardContent className="py-16 text-center">
          <Mail className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">No email campaigns yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Create your first email campaign to send announcements, updates, or promotions to your platform creators.
          </p>
          <Button size="sm" className="mt-4 bg-violet-600 hover:bg-violet-700 text-white">
            <Plus className="h-4 w-4 mr-1.5" />
            Create First Campaign
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
