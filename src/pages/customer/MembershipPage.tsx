import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Calendar, Shield, ChevronDown, Check, X } from "lucide-react";
import { plans } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import type { CustomerSession } from "./CustomerLayout";

interface Sub {
  order_id: string;
  plan_id: string;
  plan_name: string;
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

  const toggleBenefits = (orderId: string) => {
    setExpandedCard(prev => prev === orderId ? null : orderId);
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Membership Card</h1>

      <div className="flex gap-3 mb-5">
        <Badge className="bg-green-600 text-white gap-1">
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
          const plan = plans.find(p => p.id === sub.plan_id);
          const totalServices = plan?.totalServices || 3;
          const usedServices = Math.floor(Math.random() * (totalServices + 1)); // Demo: random usage
          const isExpanded = expandedCard === sub.order_id;

          const planColor = sub.plan_name.includes("Platinum") ? "bg-gradient-to-br from-gray-700 to-gray-900" :
            sub.plan_name.includes("Gold") ? "bg-gradient-to-br from-yellow-500 to-yellow-700" :
            "bg-gradient-to-br from-gray-400 to-gray-500";

          return (
            <div key={sub.order_id}>
              <Card className={`overflow-hidden ${!isActive ? "opacity-60" : ""}`}>
                <div className={`${planColor} text-white p-5 space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium opacity-80">Crossroads TAAS</div>
                    <CreditCard size={20} className="opacity-60" />
                  </div>
                  <div className="font-bold text-sm tracking-wide uppercase">{sub.plan_name}</div>
                  <div className="text-lg font-mono tracking-widest">
                    {sub.order_id.replace(/(.{3})/g, "$1 ").trim()}
                  </div>
                  <div className="text-sm font-semibold">{sub.customer_name}</div>

                  {/* Services usage indicator */}
                  <div className="bg-white/15 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="opacity-80">Services Used</span>
                      <span className="font-bold text-base">{usedServices}/{totalServices}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white rounded-full h-2 transition-all duration-500"
                        style={{ width: `${(usedServices / totalServices) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs opacity-80">
                    <div>
                      <div className="text-[10px]">Vehicle Number</div>
                      <div className="font-medium">{session.vehicle_number}</div>
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
                    <Badge className={isActive ? "bg-green-600 text-white" : "bg-destructive text-destructive-foreground"}>
                      {isActive ? "Active" : "Expired"}
                    </Badge>
                  </div>
                  {plan && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBenefits(sub.order_id)}
                      className="w-full text-primary hover:text-primary hover:bg-primary/5 gap-1 text-xs font-medium"
                    >
                      <Shield size={14} />
                      View Benefits
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown size={14} />
                      </motion.div>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Animated benefits panel */}
              <AnimatePresence>
                {isExpanded && plan && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border border-t-0 border-border rounded-b-lg bg-card p-4 space-y-3">
                      <h4 className="font-semibold text-sm text-foreground">Plan Benefits</h4>
                      <div className="divide-y divide-border">
                        {plan.benefits.map((b, idx) => (
                          <motion.div
                            key={b.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.07 }}
                            className="flex items-center justify-between py-2.5"
                          >
                            <span className="text-sm text-foreground">{b.name}</span>
                            {b.included ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <Check size={16} strokeWidth={3} />
                                <span className="text-xs font-medium">Included</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-destructive">
                                <X size={16} strokeWidth={3} />
                                <span className="text-xs font-medium">Not Included</span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground pt-1 border-t border-border">
                        <div className="flex justify-between">
                          <span>Validity</span>
                          <span className="font-medium">{plan.validity}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Total Services</span>
                          <span className="font-medium">{plan.totalServices}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Price (incl. GST)</span>
                          <span className="font-medium">₹{plan.price}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MembershipPage;
