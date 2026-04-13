import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/mock-data";
import { useCapitalContributions } from "@/hooks/useCapital";
import { DollarSign, TrendingUp, Plus, Camera, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function MobileFounderHome() {
  const navigate = useNavigate();
  const { data: contributions = [] } = useCapitalContributions();
  const myContributions = contributions.filter(
    () => true // Show all contributions for now
  );
  const myTotal = myContributions.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6 pb-4">
      {/* Greeting */}
      <div>
        <p className="text-muted-foreground text-sm">Welcome back,</p>
        <h2 className="text-2xl font-bold text-foreground">{currentUser.name.split(" ")[0]} 👋</h2>
      </div>

      {/* Balance card */}
      <Card className="bg-primary text-primary-foreground overflow-hidden relative">
        <CardContent className="p-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
          <p className="text-sm text-primary-foreground/70 font-medium mb-1">My Total Contributions</p>
          <p className="text-3xl font-bold font-mono mb-3">{formatCurrency(myTotal / 100)}</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-primary-foreground/80">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{myContributions.length} contributions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/capital")}
          className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-card border border-border shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">Add Contribution</span>
        </button>
        <button
          onClick={() => navigate("/receipts")}
          className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-card border border-border shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">Scan Receipt</span>
        </button>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {myContributions.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">No activity yet</div>
            ) : myContributions.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
                  <ArrowUpRight className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(c.date).toLocaleDateString()}</p>
                </div>
                <p className="text-sm font-semibold font-mono text-foreground">
                  {formatCurrency(c.amount / 100)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* My Contributions summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">My Contributions</h3>
          <button onClick={() => navigate("/capital")} className="text-xs text-primary font-medium">
            View all →
          </button>
        </div>
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {myContributions.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.description}</p>
                    <p className="text-xs text-muted-foreground">{c.category} · {c.date}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-sm font-semibold font-mono">{formatCurrency(c.amount)}</p>
                  {c.hasReceipt && (
                    <span className="text-[10px] text-primary font-medium">📎 Receipt</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
