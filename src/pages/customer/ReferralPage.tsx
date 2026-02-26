import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2, Users, CheckCircle, Clock, Phone } from "lucide-react";
import type { CustomerSession } from "./CustomerLayout";

const demoReferrals = [
  { name: "Amit Sharma", mobile: "98765*****", date: "2026-01-15", status: "Converted" },
  { name: "Priya Gupta", mobile: "87654*****", date: "2026-02-01", status: "Pending" },
  { name: "Rahul Verma", mobile: "76543*****", date: "2026-02-10", status: "Converted" },
  { name: "Neha Singh", mobile: "65432*****", date: "2026-02-20", status: "Pending" },
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
      `Join Crossroads TAAS – India's best tyre assistance service! Use my referral code: ${referralCode}. Register now!`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const shareEmail = () => {
    const subject = encodeURIComponent("Join Crossroads TAAS");
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to invite you to Crossroads TAAS. Use my referral code: ${referralCode} to get started.\n\nRegister now!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const totalReferrals = demoReferrals.length;
  const converted = demoReferrals.filter(r => r.status === "Converted").length;
  const pending = demoReferrals.filter(r => r.status === "Pending").length;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">My Referral</h1>

      {/* Share section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Share2 size={18} /> Share Your Referral Code & Earn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted rounded-lg px-5 py-3 text-lg font-mono font-bold tracking-widest text-foreground">
              {referralCode}
            </div>
            <Button variant="outline" size="icon" onClick={copyCode}><Copy size={16} /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={shareWhatsApp} className="bg-green-600 hover:bg-green-700 text-white gap-2">
              <Share2 size={14} /> WhatsApp
            </Button>
            <Button size="sm" variant="outline" onClick={shareEmail} className="gap-2">
              <Share2 size={14} /> Email
            </Button>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Phone size={12} /> For immediate help, call our 24/7 helpline: <strong>01147090909</strong>
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center py-4">
          <Users size={20} className="mx-auto text-primary mb-1" />
          <div className="text-2xl font-bold text-foreground">{totalReferrals}</div>
          <div className="text-xs text-muted-foreground">Total Referrals</div>
        </Card>
        <Card className="text-center py-4">
          <CheckCircle size={20} className="mx-auto text-green-600 mb-1" />
          <div className="text-2xl font-bold text-foreground">{converted}</div>
          <div className="text-xs text-muted-foreground">Converted</div>
        </Card>
        <Card className="text-center py-4">
          <Clock size={20} className="mx-auto text-yellow-600 mb-1" />
          <div className="text-2xl font-bold text-foreground">{pending}</div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </Card>
      </div>

      {/* History table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Referral History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
                    <Badge className={r.status === "Converted" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
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
