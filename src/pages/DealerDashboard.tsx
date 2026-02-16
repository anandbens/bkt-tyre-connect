import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/StatCard";
import { useToast } from "@/hooks/use-toast";
import { mockCustomers, mockSubscriptions } from "@/data/mockData";
import { Users, TrendingUp, ShieldCheck, Phone, ArrowRight } from "lucide-react";

const DealerDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [filterPlan, setFilterPlan] = useState("all");
  const [searchCustomer, setSearchCustomer] = useState("");

  const dealerCode = "DLR12345";
  const dealerCustomers = mockCustomers.filter((c) => c.dealer_code === dealerCode);
  const dealerSubs = mockSubscriptions.filter((s) => s.dealer_code === dealerCode);
  const conversionRate = dealerCustomers.length > 0 ? Math.round((dealerSubs.length / dealerCustomers.length) * 100) : 0;

  const filteredSubs = dealerSubs.filter((s) => {
    if (filterPlan !== "all" && s.plan_id !== filterPlan) return false;
    if (searchCustomer && !s.customer_name.toLowerCase().includes(searchCustomer.toLowerCase()) && !s.customer_code.includes(searchCustomer) && !(s.customer_mobile || "").includes(searchCustomer)) return false;
    return true;
  });

  const handleLogin = () => {
    if (otp === "1234") {
      setLoggedIn(true);
      toast({ title: "Welcome, Sharma Tyres!", description: "Dealer dashboard loaded." });
    } else {
      toast({ title: "Invalid OTP", variant: "destructive" });
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="w-full max-w-sm shadow-elevated">
            <CardHeader className="text-center">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <Phone className="text-accent" size={24} />
              </div>
              <CardTitle>Dealer Login</CardTitle>
              <p className="text-sm text-muted-foreground">Enter your registered mobile number</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="space-y-1.5">
                    <Label>Mobile Number</Label>
                    <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10-digit number" maxLength={10} />
                  </div>
                  <Button onClick={() => { setOtpSent(true); toast({ title: "OTP Sent", description: "Use 1234 for demo." }); }} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Send OTP <ArrowRight size={16} className="ml-1" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label>Enter OTP</Label>
                    <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="4-digit OTP" maxLength={4} className="text-center tracking-widest" />
                  </div>
                  <Button onClick={handleLogin} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Login
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="bg-primary text-primary-foreground py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Dealer Dashboard</h1>
              <p className="text-sm opacity-70">Sharma Tyres · {dealerCode}</p>
            </div>
            <Badge className="bg-success text-success-foreground">Active</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 -mt-4 space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard title="Total Registrations" value={dealerCustomers.length} icon={Users} variant="accent" />
          <StatCard title="Active Subscriptions" value={dealerSubs.length} icon={ShieldCheck} variant="success" />
          <StatCard title="Conversion Rate" value={`${conversionRate}%`} icon={TrendingUp} variant="info" description={`${dealerSubs.length} of ${dealerCustomers.length} converted`} />
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base">Subscriptions</CardTitle>
              <div className="flex gap-2">
                <Input placeholder="Search name / mobile..." value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} className="w-48" />
                <Select value={filterPlan} onValueChange={setFilterPlan}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="All Plans" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="PLAN_SILVER">Silver</SelectItem>
                    <SelectItem value="PLAN_GOLD">Gold</SelectItem>
                    <SelectItem value="PLAN_PLATINUM">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubs.map((sub) => (
                  <TableRow key={sub.order_id}>
                    <TableCell>
                      <div className="font-medium">{sub.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{sub.customer_code}</div>
                    </TableCell>
                    <TableCell className="text-sm">{sub.customer_mobile || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{sub.plan_name.replace(" Assistance Plan", "")}</Badge>
                    </TableCell>
                    <TableCell>₹{sub.plan_price}</TableCell>
                    <TableCell>
                      <Badge className="bg-success/15 text-success border-0">{sub.payment_status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{sub.subscription_end_date}</TableCell>
                  </TableRow>
                ))}
                {filteredSubs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No subscriptions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DealerDashboard;
