import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import type { CustomerSession } from "./CustomerLayout";

interface Txn {
  id: string;
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
        .eq("customer_code", session.customer_code)
        .order("order_timestamp", { ascending: false });
      setTxns((data as Txn[]) || []);
      setLoading(false);
    };
    fetch();
  }, [session.customer_code]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">My Transactions</h1>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : txns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount (₹)</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Validity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txns.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.order_id}</TableCell>
                      <TableCell>{t.plan_name}</TableCell>
                      <TableCell>₹{Number(t.plan_price).toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge variant={t.payment_status === "SUCCESS" ? "default" : "secondary"}>
                          {t.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{t.payment_transaction_id || "-"}</TableCell>
                      <TableCell>{new Date(t.order_timestamp).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(t.subscription_start_date).toLocaleDateString("en-IN")} –{" "}
                        {new Date(t.subscription_end_date).toLocaleDateString("en-IN")}
                      </TableCell>
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
