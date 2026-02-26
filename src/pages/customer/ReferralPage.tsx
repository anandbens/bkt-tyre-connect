import React from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2, Phone, Users, CheckCircle, Clock } from "lucide-react";
import type { CustomerSession } from "./CustomerLayout";

const demoReferrals = [
  { name: "Rahul Sharma", mobile: "98765***10", date: "2026-01-15", status: "Converted" },
  { name: "Priya Singh", mobile: "87654***21", date: "2026-02-01", status: "Pending" },
  { name: "Amit Patel", mobile: "76543***32", date: "2026-02-10", status: "Converted" },
  { name: "Neha Gupta", mobile: "65432***43", date: "2026-02-20", status: "Pending" },
];

const ReferralPage: React.FC = () => {
  const session = useOutletContext<CustomerSession>();
  const { toast } = useToast();
  const referralCode = session.customer_code;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({ title: "Copied!", description: "Referral code copied to clipboard." });
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(
      `Join Crossroads TAAS! Use my referral code: ${referralCode}. Get roadside assistance for your vehicle.`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const shareEmail = () => {
    const subject = encodeURIComponent("Join Crossroads TAAS - Tyre Assistance");
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to refer you to Crossroads TAAS. Use my referral code: ${referralCode} to register.\n\nBest regards,\n${session.customer_name}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const totalReferrals = demoReferrals.length;
  const converted = demoReferrals.filter((r) => r.status === "Converted").length;
  const pending = demoReferrals.filter((r) => r.status === "Pending").length;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">My Referral</h1>

      {/* Share section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Share Your Referral Code & Earn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-muted px-4 py-2 rounded-md font-mono text-lg font-bold tracking-widest text-primary">
              {referralCode}
            </div>
            <Button size="sm" variant="outline" onClick={copyCode}>
              <Copy size={14} /> Copy
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={shareWhatsApp}>
              WhatsApp
            </Button>
            <Button size="sm" variant="secondary" onClick={shareEmail}>
              Email
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone size={14} />
            For immediate help, call our 24/7 helpline: <strong>01147090909</strong>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Users className="text-primary" size={28} />
            <div>
              <p className="text-2xl font-bold">{totalReferrals}</p>
              <p className="text-xs text-muted-foreground">Total Referrals</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <CheckCircle className="text-green-600" size={28} />
            <div>
              <p className="text-2xl font-bold">{converted}</p>
              <p className="text-xs text-muted-foreground">Successful Conversions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Clock className="text-amber-500" size={28} />
            <div>
              <p className="text-2xl font-bold">{pending}</p>
              <p className="text-xs text-muted-foreground">Pending Referrals</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral history */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoReferrals.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.mobile}</TableCell>
                  <TableCell>{new Date(r.date).toLocaleDateString("en-IN")}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "Converted" ? "default" : "secondary"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralPage;
