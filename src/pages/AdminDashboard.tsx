import React, { useState, useEffect, useRef } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { Users, ShieldCheck, TrendingUp, Store, Phone, ArrowRight, Download, ChevronLeft, ChevronRight, Upload, LogOut } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


const PAGE_SIZE = 10;

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const { user, loading: authLoading, userRole, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [authError, setAuthError] = useState("");

  const [filterPlan, setFilterPlan] = useState("all");
  const [filterDealer, setFilterDealer] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [customers, setCustomers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);

  const [subPage, setSubPage] = useState(1);
  const [custPage, setCustPage] = useState(1);
  const [dealerPage, setDealerPage] = useState(1);

  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && userRole === 'admin') fetchData();
  }, [user, userRole]);

  useEffect(() => { setSubPage(1); setCustPage(1); setDealerPage(1); }, [filterPlan, filterDealer, searchQuery, dateFrom, dateTo]);

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

  const paginate = <T,>(data: T[], page: number) => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  };
  const totalPages = (total: number) => Math.max(1, Math.ceil(total / PAGE_SIZE));

  const PaginationControls = ({ page, setPage, total }: { page: number; setPage: (p: number) => void; total: number }) => {
    const tp = totalPages(total);
    if (tp <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-4 px-1">
        <span className="text-xs text-muted-foreground">
          Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft size={16} />
          </Button>
          {Array.from({ length: tp }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === tp || Math.abs(p - page) <= 1)
            .map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-xs text-muted-foreground px-1">…</span>}
                <Button variant={p === page ? "default" : "outline"} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(p)}>
                  {p}
                </Button>
              </React.Fragment>
            ))}
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= tp} onClick={() => setPage(page + 1)}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  };

  const exportToExcel = () => {
    const dealerMap = Object.fromEntries(dealers.map((d) => [d.dealer_code, d]));
    const customerMap = Object.fromEntries(customers.map((c) => [c.customer_code, c]));

    const rows = filteredSubs.map((s) => {
      const c = customerMap[s.customer_code] || {};
      const d = dealerMap[s.dealer_code] || {};
      return {
        "Order ID": s.order_id,
        "Customer Code": s.customer_code,
        "Customer Name": s.customer_name,
        "Customer Mobile": s.customer_mobile || "",
        "Customer Email": c.email || "",
        "Customer State": c.state || "",
        "Customer City": c.city || "",
        "Vehicle Number": c.vehicle_number || "",
        "Vehicle Make/Model": c.vehicle_make_model || "",
        "Tyre Details": c.tyre_details || "",
        "Number of Tyres": c.number_of_tyres || "",
        "Invoice Number": c.invoice_number || "",
        "Registration Date": c.registration_date || "",
        "Dealer Code": s.dealer_code,
        "Dealer Name": d.dealer_name || "",
        "Dealer Mobile": d.dealer_mobile_number || "",
        "Dealer Email": d.dealer_email || "",
        "Dealer City": d.dealer_city || "",
        "Dealer State": d.dealer_state || "",
        "Dealer GSTIN": d.dealer_gstin || "",
        "Dealer Channel": d.dealer_channel_type || "",
        "Plan ID": s.plan_id,
        "Plan Name": s.plan_name,
        "Plan Price": s.plan_price,
        "Payment Status": s.payment_status,
        "Payment Transaction ID": s.payment_transaction_id || "",
        "Subscription Start": s.subscription_start_date,
        "Subscription End": s.subscription_end_date,
        "Order Timestamp": s.order_timestamp,
      };
    });

    if (rows.length === 0) {
      toast({ title: "No data to export", description: "Apply filters and ensure there are results.", variant: "destructive" });
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => headers.map(h => {
        const val = String((row as Record<string, string>)[h] ?? "").replace(/"/g, '""');
        return `"${val}"`;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BKT_TAAS_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: `${rows.length} records exported to CSV.` });
  };

  // CSV Dealer Import
  const handleDealerCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast({ title: "Invalid file", description: "Please upload a .csv file.", variant: "destructive" });
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        toast({ title: "Empty file", description: "CSV must have a header row and at least one data row.", variant: "destructive" });
        setImporting(false);
        return;
      }

      const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
      const codeIdx = header.findIndex((h) => h.includes("dealer") && h.includes("code"));
      const statusIdx = header.findIndex((h) => h.includes("status"));

      if (codeIdx === -1 || statusIdx === -1) {
        toast({ title: "Invalid CSV format", description: "CSV must have 'Dealer Code' and 'Status' columns.", variant: "destructive" });
        setImporting(false);
        return;
      }

      let added = 0, updated = 0, errors = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/"/g, ""));
        const dealerCode = cols[codeIdx]?.toUpperCase();
        const status = cols[statusIdx]?.toUpperCase();

        if (!dealerCode || !status) { errors++; continue; }
        if (status !== "ACTIVE" && status !== "INACTIVE") { errors++; continue; }

        // Check if dealer exists
        const { data: existing } = await supabase
          .from("dealers")
          .select("dealer_code")
          .eq("dealer_code", dealerCode)
          .maybeSingle();

        if (existing) {
          // Update status
          await supabase
            .from("dealers")
            .update({ dealer_status: status })
            .eq("dealer_code", dealerCode);
          updated++;
        } else {
          // Insert new dealer with minimal info
          await supabase
            .from("dealers")
            .insert({
              dealer_code: dealerCode,
              dealer_name: dealerCode, // placeholder
              dealer_mobile_number: "0000000000", // placeholder
              dealer_status: status,
            });
          added++;
        }
      }

      toast({
        title: "Import Complete",
        description: `${added} added, ${updated} updated${errors > 0 ? `, ${errors} skipped` : ""}.`,
      });
      fetchData();
    } catch (err: any) {
      toast({ title: "Import Error", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadCSVTemplate = () => {
    const csv = "Dealer Code,Status\nDLR00001,ACTIVE\nDLR00002,INACTIVE\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "dealer_import_template.csv";
    link.click();
  };

  const handleLogin = async () => {
    setAuthError("");
    if (!email || !password) {
      setAuthError("Please enter email and password.");
      return;
    }
    const { error } = await signIn(email, password);
    if (error) {
      setAuthError(error.message);
      return;
    }
    toast({ title: "Welcome, Admin", description: "Admin dashboard loaded." });
  };

  

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
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
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
              </div>
              {authError && <p className="text-sm text-destructive">{authError}</p>}
              {user && userRole !== 'admin' && (
                <p className="text-sm text-destructive">Your account does not have admin access.</p>
              )}
              <Button onClick={handleLogin} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Login <ArrowRight size={16} className="ml-1" />
              </Button>
              {user && (
                <Button variant="outline" onClick={signOut} className="w-full">
                  Sign Out
                </Button>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm opacity-70">BKT Crossroads – Consolidated View</p>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground hover:bg-primary-foreground/10 gap-1">
              <LogOut size={14} /> Sign Out
            </Button>
          </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="registrations">Registrations</TabsTrigger>
              <TabsTrigger value="dealers">Dealers</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToExcel} className="gap-2">
                <Download size={14} /> Export Excel
              </Button>
              <Button variant="outline" size="sm" onClick={downloadCSVTemplate} className="gap-2">
                <Download size={14} /> CSV Template
              </Button>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Upload size={14} /> {importing ? "Importing..." : "Import Dealers"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleDealerCSVUpload}
              />
            </div>
          </div>

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
                    {paginate(filteredSubs, subPage).map((sub) => (
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
                <PaginationControls page={subPage} setPage={setSubPage} total={filteredSubs.length} />
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
                    {paginate(filteredCustomers, custPage).map((c) => (
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
                <PaginationControls page={custPage} setPage={setCustPage} total={filteredCustomers.length} />
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
                    {paginate(dealers, dealerPage).map((d) => (
                      <TableRow key={d.dealer_code}>
                        <TableCell className="font-mono text-xs">{d.dealer_code}</TableCell>
                        <TableCell className="font-medium">{d.dealer_name}</TableCell>
                        <TableCell>{d.dealer_mobile_number}</TableCell>
                        <TableCell>{d.dealer_city}</TableCell>
                        <TableCell>{d.dealer_state}</TableCell>
                        <TableCell>
                          <Badge className={d.dealer_status === "ACTIVE" ? "bg-success/15 text-success border-0" : "bg-destructive/15 text-destructive border-0"}>
                            {d.dealer_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{d.dealer_enrollment_date}</TableCell>
                      </TableRow>
                    ))}
                    {dealers.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No dealers found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
                <PaginationControls page={dealerPage} setPage={setDealerPage} total={dealers.length} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
