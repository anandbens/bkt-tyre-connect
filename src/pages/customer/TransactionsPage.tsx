import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Receipt } from "lucide-react";
import type { CustomerSession } from "./CustomerLayout";

interface Txn {
  order_id: string;
  plan_name: string;
  plan_price: number;
  payment_status: string;
  payment_transaction_id: string | null;
  order_timestamp: string;
  subscription_start_date: string;
  subscription_end_date: string;
}

const TransactionsPage: React.FC = () => {
  const session = useOutletContext<CustomerSession>();
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("customer_mobile", session.mobile_number)
        .order("order_timestamp", { ascending: false });
      setTxns((data as Txn[]) || []);
      setLoading(false);
    };
    fetch();
  }, [session.mobile_number]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Receipt size={20} /> My Transactions
      </h1>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-4 text-muted-foreground">Loading...</p>
          ) : txns.length === 0 ? (
            <p className="p-4 text-muted-foreground">No transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Valid Till</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txns.map(t => (
                    <TableRow key={t.order_id}>
                      <TableCell className="font-mono text-xs">{t.order_id}</TableCell>
                      <TableCell>{t.plan_name}</TableCell>
                      <TableCell>₹{t.plan_price}</TableCell>
                      <TableCell>
                        <Badge className={t.payment_status === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                          {t.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{t.payment_transaction_id || "—"}</TableCell>
                      <TableCell className="text-xs">{new Date(t.order_timestamp).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell className="text-xs">{new Date(t.subscription_end_date).toLocaleDateString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;
