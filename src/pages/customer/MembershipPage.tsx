import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Calendar, ChevronDown, Check, X, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { plans } from "@/data/mockData";
import type { CustomerSession } from "./CustomerLayout";

interface Sub {
  order_id: string;
  plan_name: string;
  plan_id: string;
  plan_price: number;
  payment_status: string;
  subscription_start_date: string;
  subscription_end_date: string;
  customer_name: string;
  customer_code: string;
}

const MembershipPage: React.FC = () => {
  const session = useOutletContext<CustomerSession>();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("customer_mobile", session.mobile_number)
        .eq("payment_status", "SUCCESS")
        .order("created_at", { ascending: false });
      setSubs((data as Sub[]) || []);
      setLoading(false);
    };
    fetch();
  }, [session.mobile_number]);

  const activeSubs = subs.filter(s => new Date(s.subscription_end_date) >= new Date());
  const inactiveSubs = subs.filter(s => new Date(s.subscription_end_date) < new Date());

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Membership Card</h1>

      <div className="flex gap-3 mb-5">
        <Badge className="bg-success text-success-foreground gap-1">
          <span className="bg-white/30 rounded-full px-1.5 text-xs">{activeSubs.length}</span> Active
        </Badge>
        <Badge variant="outline" className="text-destructive border-destructive gap-1">
          <span className="px-1.5 text-xs">{inactiveSubs.length}</span> Inactive
        </Badge>
      </div>

      {activeSubs.length === 0 && inactiveSubs.length === 0 && (
        <p className="text-muted-foreground">No subscriptions found.</p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {subs.map((sub) => {
          const isActive = new Date(sub.subscription_end_date) >= new Date();
          const planColor = sub.plan_name.includes("Platinum") ? "bg-gradient-to-br from-gray-700 to-gray-900" :
            sub.plan_name.includes("Gold") ? "bg-gradient-to-br from-yellow-500 to-yellow-700" :
            "bg-gradient-to-br from-gray-400 to-gray-500";

          const planData = plans.find(p => p.id === sub.plan_id) || plans.find(p => sub.plan_name.includes(p.name.split(" ")[0]));
          const totalServices = planData?.totalServices || 3;
          // Demo: simulate random used services
          const usedServices = isActive ? Math.floor(Math.random() * 2) : totalServices;
          const isExpanded = expandedCard === sub.order_id;

          return (
            <div key={sub.order_id}>
              <Card className={`overflow-hidden ${!isActive ? "opacity-60" : ""}`}>
                <div className={`${planColor} text-white p-5 space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium opacity-80">BKT Trishul TAAS</div>
                    <CreditCard size={20} className="opacity-60" />
                  </div>
                  <div className="font-bold text-sm tracking-wide uppercase">{sub.plan_name}</div>
                  <div className="text-lg font-mono tracking-widest">
                    {sub.order_id.replace(/(.{3})/g, "$1 ").trim()}
                  </div>
                  <div className="text-sm font-semibold">{sub.customer_name}</div>

                  {/* Services Counter */}
                  <div className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2">
                    <Activity size={16} />
                    <span className="text-xs font-medium">Services Used</span>
                    <span className="ml-auto font-bold text-base">{usedServices}/{totalServices}</span>
                  </div>

                  <div className="flex justify-between text-xs opacity-80">
                    <div>
                      <div className="text-[10px]">Vehicle Number</div>
                      <div className="font-medium">{session.vehicle_number}</div>
                    </div>
                    <div>
                      <div className="text-[10px]">Validity</div>
                      <div className="font-medium">{planData?.validity || "2 Years"}</div>
                    </div>
                    <div>
                      <div className="text-[10px]">Support</div>
                      <div className="font-medium">01147090909</div>
                    </div>
                  </div>
                </div>
                <CardContent className="pt-3 pb-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar size={14} />
                      <span>Expires: {new Date(sub.subscription_end_date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span>
                    </div>
                    <Badge className={isActive ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                      {isActive ? "Active" : "Expired"}
                    </Badge>
                  </div>

                  {/* View Benefits Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-primary gap-1"
                    onClick={() => setExpandedCard(isExpanded ? null : sub.order_id)}
                  >
                    View Benefits
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <ChevronDown size={16} />
                    </motion.div>
                  </Button>

                  {/* Animated Benefits Panel */}
                  <AnimatePresence>
                    {isExpanded && planData && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t pt-3 mt-1 space-y-2">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Package Benefits
                          </div>
                          {planData.benefits.map((b) => (
                            <motion.div
                              key={b.name}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.05 * planData.benefits.indexOf(b) }}
                              className="flex items-center justify-between py-1.5 px-2 rounded-md bg-secondary/50"
                            >
                              <span className="flex items-center gap-2 text-sm">
                                <span className="text-lg">{b.icon}</span>
                                {b.name}
                              </span>
                              {b.included ? (
                                <Check size={18} className="text-success" />
                              ) : (
                                <X size={18} className="text-destructive" />
                              )}
                            </motion.div>
                          ))}
                          <div className="text-xs text-muted-foreground pt-1 text-center">
                            {planData.totalServices} services • {planData.validity} validity • {planData.priceLabel}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MembershipPage;