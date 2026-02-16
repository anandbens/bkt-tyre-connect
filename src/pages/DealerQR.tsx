import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DealerQR: React.FC = () => {
  const { toast } = useToast();
  const [dealerCode, setDealerCode] = useState("DLR12345");
  const [copied, setCopied] = useState(false);

  const registrationUrl = `${window.location.origin}/?dealer=${dealerCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    toast({ title: "Link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
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
      const link = document.createElement("a");
      link.download = `QR-${dealerCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
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
              <CardDescription>Customers scan this code to register with your dealer code auto-filled.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label>Dealer Code</Label>
                <Input value={dealerCode} onChange={(e) => setDealerCode(e.target.value.toUpperCase())} placeholder="DLR12345" />
              </div>

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
                <Button onClick={handleDownload} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Download size={16} className="mr-2" /> Download QR
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DealerQR;
