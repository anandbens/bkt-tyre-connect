import React, { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { Users, ShieldCheck, TrendingUp, Store, Phone, ArrowRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [filterPlan, setFilterPlan] = useState("all");
  const [filterDealer, setFilterDealer] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [customers, setCustomers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);

  useEffect(() => {
    if (loggedIn) fetchData();
  }, [loggedIn]);

  const fetchData = async () => {
    const [custRes, subRes, dlrRes] = await Promise.all([
      supabase.from("customers").select("*"),
      supabase.from("subscriptions").select("*"),
      supabase.from("dealers").select("*"),
    ]);
    if (custRes.data) setCustomers(custRes.data);
    if (subRes.data) setSubscriptions(subRes.data);
    if (dlrRes.data) setDealers(dlrRes.data);
  };

  const conversionRate = customers.length > 0 ? Math.round((subscriptions.length / customers.length) * 100) : 0;

  const filteredSubs = subscriptions.filter((s) => {
    if (filterPlan !== "all" && s.plan_id !== filterPlan) return false;
    if (filterDealer !== "all" && s.dealer_code !== filterDealer) return false;
    if (dateFrom && s.subscription_start_date < dateFrom) return false;
    if (dateTo && s.subscription_start_date > dateTo) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.customer_name.toLowerCase().includes(q) || s.customer_code.includes(searchQuery) || s.dealer_code.includes(searchQuery) || (s.customer_mobile || "").includes(searchQuery);
    }
    return true;
  });

  const filteredCustomers = customers.filter((c) => {
    if (filterDealer !== "all" && c.dealer_code !== filterDealer) return false;
    if (dateFrom && c.registration_date < dateFrom) return false;
    if (dateTo && c.registration_date > dateTo) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.customer_name.toLowerCase().includes(q) || c.customer_code.includes(q);
    }
    return true;
  });

  const handleLogin = () => {
    if (otp === "1234") {
      setLoggedIn(true);
      toast({ title: "Welcome, Admin", description: "Admin dashboard loaded." });
    } else {
      toast({ title: "Invalid OTP", variant: "destructive" });
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="w-full max-w-sm shadow-elevated">
            <CardHeader className="text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="text-primary" size={24} />
              </div>
              <CardTitle>Admin Login</CardTitle>
              <p className="text-sm text-muted-foreground">BKT / BIW Admin access</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="space-y-1.5">
                    <Label>Mobile Number</Label>
                    <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10-digit number" maxLength={10} />
                  </div>
                  <Button onClick={() => { setOtpSent(true); toast({ title: "OTP Sent", description: "Use 1234 for demo." }); }} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Send OTP <ArrowRight size={16} className="ml-1" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label>Enter OTP</Label>
                    <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="4-digit OTP" maxLength={4} className="text-center tracking-widest" />
                  </div>
                  <Button onClick={handleLogin} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
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
    <div className="min-h-[calc(100vh-56px)] bg-background">
      <div className="bg-primary text-primary-foreground py-6 sm:py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-lg sm:text-xl font-bold">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm opacity-70">BKT Crossroads – Consolidated View</p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 pt-4 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Total Dealers" value={dealers.length} icon={Store} variant="accent" />
          <StatCard title="Registrations" value={customers.length} icon={Users} variant="info" />
          <StatCard title="Subscriptions" value={subscriptions.length} icon={ShieldCheck} variant="success" />
          <StatCard title="Conversion" value={`${conversionRate}%`} icon={TrendingUp} />
        </div>

        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="py-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Search</Label>
                <Input placeholder="Name / Code / Mobile" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Plan</Label>
                <Select value={filterPlan} onValueChange={setFilterPlan}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="PLAN_SILVER">Silver</SelectItem>
                    <SelectItem value="PLAN_GOLD">Gold</SelectItem>
                    <SelectItem value="PLAN_PLATINUM">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Dealer</Label>
                <Select value={filterDealer} onValueChange={setFilterDealer}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dealers</SelectItem>
                    {dealers.map((d) => (
                      <SelectItem key={d.dealer_code} value={d.dealer_code}>{d.dealer_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">From</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">To</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="subscriptions" className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="dealers">Dealers</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions">
            <Card className="shadow-card">
              <CardContent className="pt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Dealer</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valid Until</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubs.map((sub) => (
                      <TableRow key={sub.order_id}>
                        <TableCell className="font-mono text-xs">{sub.order_id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{sub.customer_name}</div>
                          <div className="text-xs text-muted-foreground">{sub.customer_code}</div>
                        </TableCell>
                        <TableCell className="text-sm">{sub.customer_mobile || "—"}</TableCell>
                        <TableCell className="text-sm">{sub.dealer_code}</TableCell>
                        <TableCell><Badge variant="outline">{sub.plan_name.replace(" Assistance Plan", "")}</Badge></TableCell>
                        <TableCell>₹{sub.plan_price}</TableCell>
                        <TableCell><Badge className="bg-success/15 text-success border-0">{sub.payment_status}</Badge></TableCell>
                        <TableCell className="text-sm">{sub.subscription_end_date}</TableCell>
                      </TableRow>
                    ))}
                    {filteredSubs.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No results.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations">
            <Card className="shadow-card">
              <CardContent className="pt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Dealer</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((c) => (
                      <TableRow key={c.customer_code}>
                        <TableCell className="font-mono text-xs">{c.customer_code}</TableCell>
                        <TableCell className="font-medium">{c.customer_name}</TableCell>
                        <TableCell>{c.mobile_number}</TableCell>
                        <TableCell>{c.city}</TableCell>
                        <TableCell>
                          <div>{c.vehicle_number}</div>
                          <div className="text-xs text-muted-foreground">{c.vehicle_make_model}</div>
                        </TableCell>
                        <TableCell>{c.dealer_code}</TableCell>
                        <TableCell className="text-sm">{c.registration_date}</TableCell>
                      </TableRow>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No results.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dealers">
            <Card className="shadow-card">
              <CardContent className="pt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enrolled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealers.map((d) => (
                      <TableRow key={d.dealer_code}>
                        <TableCell className="font-mono text-xs">{d.dealer_code}</TableCell>
                        <TableCell className="font-medium">{d.dealer_name}</TableCell>
                        <TableCell>{d.dealer_mobile_number}</TableCell>
                        <TableCell>{d.dealer_city}</TableCell>
                        <TableCell>{d.dealer_state}</TableCell>
                        <TableCell><Badge className="bg-success/15 text-success border-0">{d.dealer_status}</Badge></TableCell>
                        <TableCell className="text-sm">{d.dealer_enrollment_date}</TableCell>
                      </TableRow>
                    ))}
                    {dealers.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No dealers found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
