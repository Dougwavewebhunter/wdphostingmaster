import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, CreditCard, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import logo from "@/assets/wdphost-logo.png";

type Order = Tables<"orders">;
type OrderStatus = "pending" | "processing" | "active";
type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "cancelled";

const statusSteps: OrderStatus[] = ["pending", "processing", "active"];
const paymentStatuses: PaymentStatus[] = ["unpaid", "pending", "paid", "failed", "cancelled"];

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(cents / 100);

const titleCase = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const Admin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem("wdphost-admin-token") ?? "");

  const counts = useMemo(
    () => statusSteps.map((status) => ({ status, total: orders.filter((order) => order.status === status).length })),
    [orders],
  );

  const callAdmin = async (method: "GET" | "PATCH", body?: Record<string, unknown>) => {
    const { data, error: invokeError } = await supabase.functions.invoke("admin-orders", {
      method,
      headers: adminToken ? { "x-admin-token": adminToken } : undefined,
      body,
    });
    if (invokeError || data?.error) throw new Error(data?.error ?? invokeError?.message ?? "Admin request failed");
    return data;
  };

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await callAdmin("GET");
      setOrders(data.orders ?? []);
      if (adminToken) sessionStorage.setItem("wdphost-admin-token", adminToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (orderId: string, updates: { status?: OrderStatus; paymentStatus?: PaymentStatus; adminNotes?: string }) => {
    setError("");
    try {
      const data = await callAdmin("PATCH", { orderId, ...updates });
      setOrders((current) => current.map((order) => (order.id === orderId ? data.order : order)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update order");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <main className="min-h-screen bg-radial-grid px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-border/50 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="WDPHOST logo" className="h-14 w-14 rounded-md object-cover shadow-neon" />
            <div>
              <p className="font-bold text-neon-cyan">WDPHOST CONTROL</p>
              <h1 className="text-4xl font-black">Admin orders</h1>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="Admin token if configured"
              className="bg-input sm:w-64"
            />
            <Button variant="glass" onClick={loadOrders}><RefreshCw /> Refresh</Button>
            <Button variant="hero" asChild><a href="/"><ArrowLeft /> Site</a></Button>
          </div>
        </header>

        <section className="grid gap-4 py-8 md:grid-cols-4">
          {counts.map(({ status, total }) => (
            <div key={status} className="glass-panel rounded-lg p-5">
              <p className="text-sm font-bold uppercase text-muted-foreground">{titleCase(status)}</p>
              <p className="mt-2 text-4xl font-black">{total}</p>
            </div>
          ))}
          <div className="glass-panel rounded-lg p-5">
            <p className="text-sm font-bold uppercase text-muted-foreground">Manual workflow</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-neon-success"><ShieldCheck className="h-5 w-5" /> No auto-registration</p>
          </div>
        </section>

        {error && <p className="mb-5 rounded-md border border-neon-danger/50 bg-surface-elevated p-4 text-sm font-bold text-neon-danger">{error}</p>}
        {loading ? <p className="glass-panel rounded-lg p-6 text-muted-foreground">Loading orders...</p> : null}

        <section className="grid gap-5">
          {orders.map((order) => (
            <article key={order.id} className="glass-panel rounded-lg p-5">
              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-md border border-border bg-surface-elevated px-3 py-1 text-xs font-black uppercase text-neon-cyan">{order.payment_reference}</span>
                    <span className="rounded-md border border-border bg-surface-elevated px-3 py-1 text-xs font-black uppercase">{titleCase(order.status)}</span>
                    <span className="rounded-md border border-border bg-surface-elevated px-3 py-1 text-xs font-black uppercase text-neon-gold">{titleCase(order.payment_status)}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-black">{order.domain_name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{order.plan_name} · {titleCase(order.billing_cycle)} · {money(order.amount_cents, order.currency)}</p>
                  <div className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <p><strong className="text-foreground">Customer:</strong> {order.customer_name}</p>
                    <p><strong className="text-foreground">Email:</strong> {order.customer_email}</p>
                    <p><strong className="text-foreground">Phone:</strong> {order.customer_phone ?? "—"}</p>
                    <p><strong className="text-foreground">Payment:</strong> {titleCase(order.payment_provider)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-bold text-muted-foreground"><Clock3 className="h-4 w-4" /> Order workflow</p>
                    <div className="grid grid-cols-3 gap-2">
                      {statusSteps.map((status) => (
                        <Button key={status} variant={order.status === status ? "hero" : "glass"} size="sm" onClick={() => updateOrder(order.id, { status })}>
                          {status === "active" && <CheckCircle2 />} {titleCase(status)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-bold text-muted-foreground"><CreditCard className="h-4 w-4" /> Payment tracking</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-3">
                      {paymentStatuses.map((paymentStatus) => (
                        <Button key={paymentStatus} variant={order.payment_status === paymentStatus ? "hero" : "glass"} size="sm" onClick={() => updateOrder(order.id, { paymentStatus })}>
                          {titleCase(paymentStatus)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    defaultValue={order.admin_notes ?? ""}
                    onBlur={(event) => updateOrder(order.id, { adminNotes: event.currentTarget.value })}
                    placeholder="Admin notes for domain registration, hosting setup, payment proof, or activation tasks"
                    className="bg-input"
                  />
                </div>
              </div>
            </article>
          ))}
          {!loading && orders.length === 0 && <p className="glass-panel rounded-lg p-6 text-muted-foreground">No orders yet. Create one from the checkout provision on the homepage.</p>}
        </section>
      </div>
    </main>
  );
};

export default Admin;
