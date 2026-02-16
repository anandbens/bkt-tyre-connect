import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Copy, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import bktLogoSrc from "@/assets/bkt-logo.png";

const DealerQR: React.FC = () => {
  const { toast } = useToast();
  const [dealerCode, setDealerCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [validated, setValidated] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");

  const registrationUrl = `${window.location.origin}/?dealer=${dealerCode}`;

  const validateDealerCode = async () => {
    if (!dealerCode.trim()) {
      setError("Please enter a dealer code.");
      return;
    }
    setValidating(true);
    setError("");
    try {
      const { data, error: dbError } = await supabase
        .from("dealers")
        .select("dealer_code, dealer_status")
        .eq("dealer_code", dealerCode.toUpperCase())
        .maybeSingle();

      if (dbError) throw dbError;

      if (!data) {
        setError("Dealer code not found in the system.");
        setValidated(false);
      } else if (data.dealer_status !== "ACTIVE") {
        setError("This dealer code is inactive. Contact admin.");
        setValidated(false);
      } else {
        setValidated(true);
        toast({ title: "Dealer Verified!", description: "You can now generate and download your QR code." });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setValidating(false);
    }
  };

  const handleCopy = () => {
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

      // Load BKT logo
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.onload = () => {
        const logoCanvas = document.createElement("canvas");
        const logoCtx = logoCanvas.getContext("2d");
        logoCanvas.width = logoImg.naturalWidth;
        logoCanvas.height = logoImg.naturalHeight;
        logoCtx?.drawImage(logoImg, 0, 0);
        const logoDataUrl = logoCanvas.toDataURL("image/png");

        generatePDF(qrDataUrl, logoDataUrl);
      };
      logoImg.onerror = () => {
        // Generate without logo if loading fails
        generatePDF(qrDataUrl, null);
      };
      logoImg.src = bktLogoSrc;
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const generatePDF = (qrDataUrl: string, logoDataUrl: string | null) => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210;

    // Green header bar
    pdf.setFillColor(30, 100, 50);
    pdf.rect(0, 0, pageW, 50, "F");

    // BKT Logo
    if (logoDataUrl) {
      pdf.addImage(logoDataUrl, "PNG", (pageW - 60) / 2, 8, 60, 30);
    } else {
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont("helvetica", "bold");
      pdf.text("BKT", pageW / 2, 30, { align: "center" });
    }

    // Tagline
    pdf.setTextColor(180, 230, 50);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text("Tyre Service & Road Side Assistance Support", pageW / 2, 46, { align: "center" });

    // "SCAN TO REGISTER" big text
    pdf.setTextColor(30, 100, 50);
    pdf.setFontSize(32);
    pdf.setFont("helvetica", "bold");
    pdf.text("SCAN TO REGISTER", pageW / 2, 75, { align: "center" });

    // Decorative line
    pdf.setDrawColor(180, 230, 50);
    pdf.setLineWidth(1);
    pdf.line(40, 80, pageW - 40, 80);

    // QR Code
    const qrSize = 90;
    pdf.addImage(qrDataUrl, "PNG", (pageW - qrSize) / 2, 90, qrSize, qrSize);

    // Dealer code
    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Dealer Code: ${dealerCode}`, pageW / 2, 195, { align: "center" });

    // Instructions
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Scan the QR code above with your phone camera", pageW / 2, 210, { align: "center" });
    pdf.text("to register for BKT Crossroads Tyre Assistance", pageW / 2, 217, { align: "center" });

    // Footer bar
    pdf.setFillColor(30, 100, 50);
    pdf.rect(0, 270, pageW, 27, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.text("BKT Crossroads – Tyre Assistance As A Service (TAAS)", pageW / 2, 282, { align: "center" });
    pdf.text("www.bfrtyres.com | Powered by BKT", pageW / 2, 289, { align: "center" });

    pdf.save(`BKT_QR_${dealerCode}.pdf`);
    toast({ title: "PDF Downloaded!", description: "Print and place on your counter for customers to scan." });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="bg-primary text-primary-foreground py-10 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-2">Dealer QR Code</h1>
          <p className="text-sm opacity-80">Generate a QR code for customer registration referral</p>
        </div>
      </div>

      <div className="container mx-auto max-w-lg px-4 -mt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-elevated">
            <CardHeader className="text-center pb-2">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <QrCode className="text-accent" size={24} />
              </div>
              <CardTitle className="text-lg">Registration QR Code</CardTitle>
              <CardDescription>Enter your dealer code to verify and generate your QR code.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label>Dealer Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={dealerCode}
                    onChange={(e) => {
                      setDealerCode(e.target.value.toUpperCase());
                      setValidated(false);
                      setError("");
                    }}
                    placeholder="Enter your dealer code"
                  />
                  <Button onClick={validateDealerCode} disabled={validating} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                    {validating ? "Checking..." : "Verify"}
                  </Button>
                </div>
                {error && (
                  <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle size={14} /> {error}
                  </p>
                )}
              </div>

              {validated && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="flex justify-center p-6 bg-secondary rounded-lg">
                    <QRCodeSVG
                      id="dealer-qr-code"
                      value={registrationUrl}
                      size={220}
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
                      <Button variant="outline" size="icon" onClick={handleCopy}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleDownloadPDF} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                      <Download size={16} className="mr-2" /> Download QR (PDF)
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DealerQR;
