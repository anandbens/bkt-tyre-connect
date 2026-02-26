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
import { useAuth } from "@/hooks/useAuth";
import { Users, TrendingUp, ShieldCheck, Phone, ArrowRight, LogOut, QrCode, Download, Copy, Check } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import bktLogoSrc from "@/assets/bkt-logo.png";

const DealerDashboard: React.FC = () => {
  const { toast } = useToast();
  const { user, loading: authLoading, userRole, dealerCode, signOut } = useAuth();
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [authError, setAuthError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [filterPlan, setFilterPlan] = useState("all");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [dealerInfo, setDealerInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const registrationUrl = dealerCode ? `${window.location.origin}/?dealer=${dealerCode}` : "";

  useEffect(() => {
    if (user && userRole === 'dealer' && dealerCode) {
      fetchData();
    }
  }, [user, userRole, dealerCode]);

  const fetchData = async () => {
    if (!dealerCode) return;
    const [custRes, subRes, dlrRes] = await Promise.all([
      supabase.from("customers").select("*").eq("dealer_code", dealerCode),
      supabase.from("subscriptions").select("*").eq("dealer_code", dealerCode),
      supabase.from("dealers").select("*").eq("dealer_code", dealerCode).maybeSingle(),
    ]);
    if (custRes.data) setCustomers(custRes.data);
    if (subRes.data) setSubscriptions(subRes.data);
    if (dlrRes.data) setDealerInfo(dlrRes.data);
  };

  const conversionRate = customers.length > 0 ? Math.round((subscriptions.length / customers.length) * 100) : 0;

  const filteredSubs = subscriptions.filter((s) => {
    if (filterPlan !== "all" && s.plan_id !== filterPlan) return false;
    if (searchCustomer) {
      const q = searchCustomer.toLowerCase();
      if (!s.customer_name.toLowerCase().includes(q) && !s.customer_code.includes(searchCustomer) && !(s.customer_mobile || "").includes(searchCustomer)) return false;
    }
    if (dateFrom && s.subscription_start_date < dateFrom) return false;
    if (dateTo && s.subscription_start_date > dateTo) return false;
    return true;
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    toast({ title: "Link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const svg = document.getElementById("dealer-qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx?.drawImage(img, 0, 0, 400, 400);
      const qrDataUrl = canvas.toDataURL("image/png");
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.onload = () => {
        const logoCanvas = document.createElement("canvas");
        const logoCtx = logoCanvas.getContext("2d");
        logoCanvas.width = logoImg.naturalWidth;
        logoCanvas.height = logoImg.naturalHeight;
        logoCtx?.drawImage(logoImg, 0, 0);
        generatePDF(qrDataUrl, logoCanvas.toDataURL("image/png"));
      };
      logoImg.onerror = () => generatePDF(qrDataUrl, null);
      logoImg.src = bktLogoSrc;
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const generatePDF = (qrDataUrl: string, logoDataUrl: string | null) => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210;
    pdf.setFillColor(30, 100, 50);
    pdf.rect(0, 0, pageW, 50, "F");
    if (logoDataUrl) {
      pdf.addImage(logoDataUrl, "PNG", (pageW - 60) / 2, 8, 60, 30);
    } else {
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont("helvetica", "bold");
      pdf.text("BKT", pageW / 2, 30, { align: "center" });
    }
    pdf.setTextColor(180, 230, 50);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text("Tyre Service & Road Side Assistance Support", pageW / 2, 46, { align: "center" });
    pdf.setTextColor(30, 100, 50);
    pdf.setFontSize(32);
    pdf.setFont("helvetica", "bold");
    pdf.text("SCAN TO REGISTER", pageW / 2, 75, { align: "center" });
    pdf.setDrawColor(180, 230, 50);
    pdf.setLineWidth(1);
    pdf.line(40, 80, pageW - 40, 80);
    const qrSize = 90;
    pdf.addImage(qrDataUrl, "PNG", (pageW - qrSize) / 2, 90, qrSize, qrSize);
    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Dealer Code: ${dealerCode}`, pageW / 2, 195, { align: "center" });
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Scan the QR code above with your phone camera", pageW / 2, 210, { align: "center" });
    pdf.text("to register for BKT Crossroads Tyre Assistance", pageW / 2, 217, { align: "center" });
    pdf.setFillColor(30, 100, 50);
    pdf.rect(0, 270, pageW, 27, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.text("BKT Crossroads – Tyre Assistance As A Service (TAAS)", pageW / 2, 282, { align: "center" });
    pdf.text("www.bfrtyres.com | Powered by BKT", pageW / 2, 289, { align: "center" });
    pdf.save(`BKT_QR_${dealerCode}.pdf`);
    toast({ title: "PDF Downloaded!", description: "Print and place on your counter for customers to scan." });
  };

  const handleSendOtp = async () => {
    setAuthError("");
    if (!phone || phone.length < 10) {
      setAuthError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await supabase.functions.invoke("dealer-phone-otp", {
        body: { phone, action: "send" },
      });
      if (res.error) {
        setAuthError(res.error.message || "Failed to send OTP");
        return;
      }
      if (res.data?.error) {
        setAuthError(res.data.error);
        return;
      }
      setOtpSent(true);
      toast({ title: "OTP Sent!", description: `Enter the OTP sent to ${phone}` });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setAuthError("");
    if (!otp || otp.length < 4) {
      setAuthError("Please enter the 4-digit OTP.");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await supabase.functions.invoke("dealer-phone-otp", {
        body: { phone, otp, action: "verify" },
      });
      if (res.error) {
        setAuthError(res.error.message || "Verification failed");
        return;
      }
      if (res.data?.error) {
        setAuthError(res.data.error);
        return;
      }

      // Use the token_hash to complete sign-in
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        token_hash: res.data.token_hash,
        type: "magiclink",
      });
      if (verifyErr) {
        setAuthError(verifyErr.message);
        return;
      }
      toast({ title: "Welcome!", description: "Dealer dashboard loaded." });
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || userRole !== 'dealer') {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="w-full max-w-sm shadow-elevated">
            <CardHeader className="text-center">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <Phone className="text-accent" size={24} />
              </div>
              <CardTitle>Dealer Login</CardTitle>
              <p className="text-sm text-muted-foreground">
                {otpSent ? "Enter the OTP sent to your mobile" : "Sign in with your registered mobile number"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="space-y-1.5">
                    <Label>Mobile Number</Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    />
                  </div>
                  {authError && <p className="text-sm text-destructive">{authError}</p>}
                  {user && userRole !== 'dealer' && (
                    <p className="text-sm text-destructive">Your account does not have dealer access.</p>
                  )}
                  <Button onClick={handleSendOtp} disabled={sendingOtp} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    {sendingOtp ? "Sending..." : "Send OTP"} <Phone size={16} className="ml-1" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label>Enter 4-digit OTP</Label>
                    <div className="flex justify-center">
                      <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  {authError && <p className="text-sm text-destructive">{authError}</p>}
                  <Button onClick={handleVerifyOtp} disabled={verifyingOtp} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    {verifyingOtp ? "Verifying..." : "Verify & Login"} <ArrowRight size={16} className="ml-1" />
                  </Button>
                  <button
                    onClick={() => { setOtpSent(false); setOtp(""); setAuthError(""); }}
                    className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
                  >
                    ← Change number
                  </button>
                </>
              )}
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
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Dealer Dashboard</h1>
              <p className="text-xs sm:text-sm opacity-70">{dealerInfo?.dealer_name || "Dealer"} · {dealerCode}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-success text-success-foreground">Active</Badge>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground hover:bg-primary-foreground/10 gap-1">
                <LogOut size={14} /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 pt-4 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Registrations" value={customers.length} icon={Users} variant="accent" />
          <StatCard title="Active Subscriptions" value={subscriptions.length} icon={ShieldCheck} variant="success" />
          <StatCard title="Conversion Rate" value={`${conversionRate}%`} icon={TrendingUp} variant="info" description={`${subscriptions.length} of ${customers.length} converted`} />
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col gap-3">
              <CardTitle className="text-base">Subscriptions</CardTitle>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Input placeholder="Search name / mobile..." value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} />
                <Select value={filterPlan} onValueChange={setFilterPlan}>
                  <SelectTrigger><SelectValue placeholder="All Plans" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="PLAN_SILVER">Silver</SelectItem>
                    <SelectItem value="PLAN_GOLD">Gold</SelectItem>
                    <SelectItem value="PLAN_PLATINUM">Platinum</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" />
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
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
                    <TableCell><Badge variant="outline">{sub.plan_name.replace(" Assistance Plan", "")}</Badge></TableCell>
                    <TableCell>₹{sub.plan_price}</TableCell>
                    <TableCell><Badge className="bg-success/15 text-success border-0">{sub.payment_status}</Badge></TableCell>
                    <TableCell className="text-sm">{sub.subscription_end_date}</TableCell>
                  </TableRow>
                ))}
                {filteredSubs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No subscriptions found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* QR Code Section */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <QrCode size={18} className="text-accent" />
              <CardTitle className="text-base">Your Registration QR Code</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center p-6 bg-secondary rounded-lg">
              <QRCodeSVG
                id="dealer-qr-code"
                value={registrationUrl}
                size={200}
                bgColor="transparent"
                fgColor="hsl(var(--foreground))"
                level="H"
                includeMargin
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Registration Link</Label>
              <div className="flex gap-2">
                <Input value={registrationUrl} readOnly className="text-xs" />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
            </div>
            <Button onClick={handleDownloadPDF} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Download size={16} className="mr-2" /> Download QR (PDF)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DealerDashboard;
