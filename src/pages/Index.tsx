import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Cloud,
  Globe2,
  Headphones,
  Mail,
  Menu,
  MessageCircle,
  MonitorSmartphone,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import logo from "@/assets/wdphost-logo.png";

type DomainStatus = "idle" | "checking" | "available" | "taken" | "error";

type PackageItem = {
  name: string;
  price: string;
  period: string;
  label: string;
  icon: typeof Server;
  features: string[];
};

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "27812159792";
const whmcsUrl = import.meta.env.VITE_WHMCS_URL || "#dashboard";

const navItems = ["Home", "Domains", "Hosting", "Email", "Web Design", "Dashboard", "Support"];
const toSectionId = (item: string) => item.toLowerCase().replace(/\s+/g, "-");

const heroWords = ["premium hosting", "domains included", "business emails", "web design", "secure cloud solutions"];

const hostingPlans: PackageItem[] = [
  { name: "Starter Hosting", price: "R280", period: "year", label: "Basic websites", icon: Server, features: ["Domain included", "2GB–5GB storage", "5 business emails", "Free website demo", "SSL-ready setup"] },
  { name: "Business Hosting", price: "R350", period: "year", label: "Growing businesses", icon: Cloud, features: ["Domain included", "10GB storage", "5 business emails", "E-commerce support", "Fast activation"] },
  { name: "Premium Hosting", price: "R450", period: "year", label: "Advanced hosting", icon: Rocket, features: ["Domain included", "20GB+ storage", "Unlimited websites", "Priority support", "Control panel ready"] },
];

const emailPlans: PackageItem[] = [
  { name: "Starter Email", price: "R380", period: "year", label: "5 emails", icon: Mail, features: ["5 business email addresses", "Domain included", "Hosting included", "Webmail access", "Mobile setup guidance"] },
  { name: "Standard Email", price: "R450", period: "year", label: "15 emails", icon: Mail, features: ["15 business email addresses", "Professional mailboxes", "Mobile & desktop sync", "Business signature setup", "Spam protection"] },
  { name: "Advanced Email Suite", price: "R550", period: "year", label: "30 emails", icon: ShieldCheck, features: ["30 business email addresses", "Advanced mailbox setup", "Priority support", "Outlook/mobile guidance", "Email security features"] },
];

const websitePlans: PackageItem[] = [
  { name: "Silver Starter Website", price: "R1,500", period: "once-off", label: "24 hours", icon: MonitorSmartphone, features: ["5 page website", "Free 12 months domain + hosting", "10 business emails", "Free logo & poster design", "Google Business Listing", "Online store / eCommerce up to 30 products", "Facebook page setup"] },
  { name: "Gold Business Website", price: "R2,000", period: "once-off", label: "2 days", icon: Sparkles, features: ["15 page website", "Domain + hosting included", "30 business emails", "E-commerce store up to 200 listings", "WhatsApp integration", "Google SEO setup", "Invoice & quotation software"] },
  { name: "Premium Full E-Commerce Suite", price: "R3,000", period: "once-off", label: "3–5 days", icon: ShoppingCart, features: ["Full e-commerce suite", "Domain + hosting included", "60 business emails", "Free 3D logo + poster design", "Animated video advert", "Payment gateway integration", "Inventory, analytics & POS tools"] },
];

const services = ["Domain Registration", "Linux Hosting", "Business Emails", "Website Design", "Online Stores", "POS Systems", "Inventory Systems", "Google Business Setup", "SEO Setup", "WhatsApp Integration", "Hosting Renewals", "Maintenance Plans"];

function openWhatsApp(message: string) {
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
}

function PackageCard({ plan }: { plan: PackageItem }) {
  const Icon = plan.icon;
  return (
    <article className="glass-panel group flex h-full flex-col rounded-2xl p-6 transition duration-300 hover:-translate-y-2 hover:shadow-neon">
      <div className="flex items-center justify-between gap-4">
        <div className="rounded-2xl border border-neon-cyan/40 bg-primary/10 p-3"><Icon className="text-neon-cyan" /></div>
        <span className="rounded-full border border-neon-gold/40 px-3 py-1 text-xs font-black uppercase text-neon-gold">{plan.label}</span>
      </div>
      <h3 className="mt-6 text-2xl font-black">{plan.name}</h3>
      <p className="mt-4 text-4xl font-black neon-text">{plan.price}<span className="text-sm text-muted-foreground">/{plan.period}</span></p>
      <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
        {plan.features.map((feature) => <li key={feature} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neon-success" />{feature}</li>)}
      </ul>
      <Button className="mt-7 w-full" variant="hero" onClick={() => openWhatsApp(`Hello WDP Host, I am interested in ${plan.name} (${plan.price}/${plan.period}). Please assist me.`)}>Request Package</Button>
    </article>
  );
}

function WhatsAppAssistant() {
  const [open, setOpen] = useState(false);
  const [sentOnce, setSentOnce] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setOpen(true), 120000);
    const interval = window.setInterval(() => setOpen(true), 120000);
    return () => { window.clearTimeout(showTimer); window.clearInterval(interval); };
  }, []);

  const submitLead = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = `Hello WDP Host, I need assistance.\n\nName: ${form.get("name")}\nService needed: ${form.get("service")}\nPreferred contact: ${form.get("contactMethod")}\nPhone/WhatsApp: ${form.get("phone")}\nEmail: ${form.get("email")}\nBest call time: ${form.get("callTime")}\nMeeting preference: ${form.get("meeting")}\nMessage: ${form.get("message")}`;
    setSentOnce(true);
    openWhatsApp(message);
  };

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {open && (
        <div className="mb-4 w-[92vw] max-w-sm rounded-3xl border border-neon-cyan/50 bg-background/95 p-4 shadow-neon backdrop-blur-xl">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex gap-3"><img src={logo} alt="WDP Host" className="h-11 w-11 rounded-xl object-cover" /><div><h3 className="font-black">WDP Host Assistant</h3><p className="text-xs text-muted-foreground">Tell us what you need and we will contact you.</p></div></div>
            <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={submitLead} className="space-y-2">
            <Input required name="name" placeholder="Your name" className="bg-input" />
            <select name="service" className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm">
              <option>Hosting package</option><option>Business email</option><option>Website design</option><option>Domain registration</option><option>Support / consultation</option><option>Google Meet / Zoom appointment</option>
            </select>
            <select name="contactMethod" className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm">
              <option>WhatsApp</option><option>Phone call</option><option>Email</option><option>Google Meet</option><option>Zoom meeting</option>
            </select>
            <div className="grid grid-cols-2 gap-2"><Input name="phone" placeholder="Phone/WhatsApp" className="bg-input" /><Input name="email" placeholder="Email" className="bg-input" /></div>
            <Input name="callTime" placeholder="Best time to call you" className="bg-input" />
            <Input name="meeting" placeholder="Meeting preference e.g. Zoom/Google Meet" className="bg-input" />
            <Textarea name="message" placeholder="Short message" className="bg-input" />
            <Button className="w-full" variant="hero" type="submit">Send to WhatsApp</Button>
            {sentOnce && <p className="text-xs text-neon-success">Thank you. Your WhatsApp message was prepared.</p>}
          </form>
        </div>
      )}
      <button onClick={() => setOpen(true)} className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-neon transition hover:scale-105" aria-label="Open WhatsApp assistant"><MessageCircle className="h-8 w-8 text-white" /></button>
    </div>
  );
}

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (event: any) => { event.preventDefault(); setDeferredPrompt(event); setShow(true); };
    window.addEventListener("beforeinstallprompt", handler);
    const timer = window.setTimeout(() => setShow(true), 25000);
    const interval = window.setInterval(() => setShow(true), 120000);
    return () => { window.removeEventListener("beforeinstallprompt", handler); window.clearTimeout(timer); window.clearInterval(interval); };
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShow(false);
    } else {
      alert("To install on iPhone, tap Share then Add to Home Screen. On desktop, use your browser Install App option.");
    }
  };

  return (
    <>
      {show && <div className="fixed bottom-24 right-5 z-40 hidden max-w-xs rounded-3xl border border-neon-gold/50 bg-background/95 p-4 shadow-gold backdrop-blur-xl md:block"><div className="flex gap-3"><img src={logo} alt="WDP Host app" className="h-12 w-12 rounded-xl object-cover" /><div><h3 className="font-black">Install WDP Host App</h3><p className="text-xs text-muted-foreground">Install this app on Android, iOS, Windows or desktop.</p></div></div><div className="mt-4 flex gap-2"><Button variant="hero" onClick={install}>Install App</Button><Button variant="glass" onClick={() => setShow(false)}>Later</Button></div></div>}
      <Button onClick={install} className="fixed bottom-5 right-5 z-50 rounded-full bg-orange-500 px-6 py-6 text-base font-black text-white shadow-gold hover:bg-orange-400">Install this App</Button>
    </>
  );
}

function DashboardPreview() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSignup = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");
    if (!isSupabaseConfigured) { setStatus("Supabase is not connected yet. Add Netlify environment variables first."); return; }
    const password = Math.random().toString(36).slice(2) + "Aa1!";
    const { error } = await supabase.auth.signUp({ email, password });
    setStatus(error ? error.message : "Account request created. We will link your hosting services after WHMCS/DirectAdmin is connected.");
  };

  return (
    <section id="dashboard" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div><p className="font-bold text-neon-cyan">CLIENT DASHBOARD READY</p><h2 className="mt-2 text-4xl font-black">Customer accounts before WHMCS automation.</h2><p className="mt-4 text-muted-foreground">For now customers can request an account and service. When WHMCS/DirectAdmin is active, this dashboard will link to hosting products, invoices, email accounts, renewals and control panel access.</p></div>
        <div className="glass-panel rounded-3xl p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {["Hosting Products", "Invoices & Billing", "Email Accounts"].map((item) => <div key={item} className="rounded-2xl border border-border/60 bg-surface/70 p-4"><UserRound className="text-neon-gold" /><h3 className="mt-3 font-black">{item}</h3><p className="mt-2 text-xs text-muted-foreground">WHMCS-ready account area.</p></div>)}
          </div>
          <form onSubmit={handleSignup} className="mt-6 flex flex-col gap-3 sm:flex-row"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Customer email" className="bg-input" /><Button variant="hero" type="submit">Request Account</Button></form>
          {status && <p className="mt-4 rounded-xl border border-border bg-surface p-3 text-sm text-muted-foreground">{status}</p>}
          <Button variant="glass" className="mt-4" onClick={() => openWhatsApp("Hello WDP Host, I want to request a hosting/email/website service from my dashboard.")}>Request Service</Button>
        </div>
      </div>
    </section>
  );
}

const Index = () => {
  const [domain, setDomain] = useState("");
  const [domainStatus, setDomainStatus] = useState<DomainStatus>("idle");
  const [domainMessage, setDomainMessage] = useState("");
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => { const id = window.setInterval(() => setWordIndex((i) => (i + 1) % heroWords.length), 2200); return () => window.clearInterval(id); }, []);

  const checkDomain = async (event: FormEvent) => {
    event.preventDefault();
    const cleanDomain = domain.trim().toLowerCase();
    if (!cleanDomain) return;
    setDomain(cleanDomain);
    setDomainStatus("checking");
    setDomainMessage("");
    if (!isSupabaseConfigured) { setDomainStatus("error"); setDomainMessage("Live domain lookup will activate after Supabase and WHMCS/registrar API are connected. For now send us the domain on WhatsApp."); return; }
    const { data, error } = await supabase.functions.invoke("domain-availability", { body: { domainName: cleanDomain } });
    if (error || data?.error) { setDomainStatus("error"); setDomainMessage("Lookup failed. WHMCS/registrar API may not be connected yet."); return; }
    setDomainStatus(data.available ? "available" : "taken");
    setDomainMessage(data.available ? `${cleanDomain} appears available.` : `${cleanDomain} appears taken.`);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-radial-grid text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#home" className="flex items-center gap-3"><img src={logo} alt="WDP Host" className="h-12 w-12 rounded-xl object-cover shadow-neon" /><span className="text-lg font-black tracking-wide">WDP HOST</span></a>
          <div className="hidden items-center gap-5 lg:flex">{navItems.map((item) => <a key={item} href={`#${toSectionId(item)}`} className="text-sm text-muted-foreground transition hover:text-neon-cyan">{item}</a>)}</div>
          <Button variant="glass" size="sm" onClick={() => openWhatsApp("Hello WDP Host, I need support.")}><Headphones /> Support</Button>
          <Menu className="lg:hidden" />
        </nav>
      </header>

      <section id="home" className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="animate-slide-up space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface-glass/60 px-4 py-2 text-sm text-muted-foreground backdrop-blur"><Zap className="text-neon-cyan" /> Premium hosting, domains, websites and business emails</div>
          <div className="space-y-5"><h1 className="max-w-4xl text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl">Launch your business with <span className="neon-text">{heroWords[wordIndex]}</span>.</h1><p className="max-w-2xl text-lg leading-8 text-muted-foreground">WDP Host combines domain registration, affordable hosting, professional business emails and WebDevPro website packages in one premium platform.</p></div>
          <form id="domains" onSubmit={checkDomain} className="glass-panel rounded-2xl p-3 sm:flex sm:items-center sm:gap-3"><div className="flex flex-1 items-center gap-3 rounded-xl bg-input/70 px-4 py-3"><Search className="text-neon-cyan" /><Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Search your domain e.g. mybusiness.co.za" className="border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0" /></div><Button variant="hero" size="lg" className="mt-3 w-full sm:mt-0 sm:w-auto" type="submit">{domainStatus === "checking" ? "Checking..." : "Search Domain"}</Button></form>
          {domainStatus !== "idle" && <div className="glass-panel rounded-2xl p-4"><p className="font-bold">{domainMessage}</p><Button className="mt-3" variant="glass" onClick={() => openWhatsApp(`Hello WDP Host, please assist me with this domain: ${domain}`)}>Send Domain to WhatsApp</Button></div>}
          <div className="grid gap-3 sm:grid-cols-3"><Button variant="hero" onClick={() => location.hash = "#domains"}>Search Domain</Button><Button variant="glass" onClick={() => location.hash = "#hosting"}>Get Hosting</Button><Button variant="glass" onClick={() => location.hash = "#web-design"}>Build My Website</Button></div>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/80 py-3"><div className="animate-service-marquee flex min-w-max gap-3 px-4">{[...services, ...services].map((service, i) => <span key={`${service}-${i}`} className="rounded-full border border-neon-cyan/30 bg-primary/10 px-4 py-2 text-sm font-bold text-neon-cyan">{service}</span>)}</div></div>
        </div>
        <div className="relative mx-auto w-full max-w-lg animate-float-slow"><div className="absolute inset-8 rounded-full border border-neon-cyan/50 shadow-neon animate-pulse-ring" /><img src={logo} alt="WDP Host cloud hosting" className="relative z-10 w-full rounded-3xl object-cover shadow-glass" /></div>
      </section>

      <section id="hosting" className="border-y border-border/40 bg-surface/70 py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><p className="font-bold text-neon-cyan">DOMAIN + HOSTING</p><h2 className="mt-2 text-4xl font-black">Hosting packages</h2><div className="mt-9 grid gap-5 lg:grid-cols-3">{hostingPlans.map((plan) => <PackageCard key={plan.name} plan={plan} />)}</div></div></section>
      <section id="email" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><p className="font-bold text-neon-cyan">BUSINESS EMAIL HOSTING</p><h2 className="mt-2 text-4xl font-black">Professional emails for every business.</h2><div className="mt-9 grid gap-5 lg:grid-cols-3">{emailPlans.map((plan) => <PackageCard key={plan.name} plan={plan} />)}</div></section>
      <section id="web-design" className="border-y border-border/40 bg-surface/70 py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><p className="font-bold text-neon-cyan">WEBSITE + HOSTING + EMAIL</p><h2 className="mt-2 text-4xl font-black">Complete business website packages.</h2><div className="mt-9 grid gap-5 lg:grid-cols-3">{websitePlans.map((plan) => <PackageCard key={plan.name} plan={plan} />)}</div></div></section>

      <DashboardPreview />

      <section id="support" className="border-y border-border/40 bg-surface/70 py-16"><div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">{[[Globe2,"WHMCS Ready","Prepared for domain search, invoices, customer products and automation."],[ShieldCheck,"DirectAdmin Ready","Built to connect to your reseller hosting backend when account access is restored."],[Headphones,"Human Support","Visitors can request call backs, WhatsApp, email, Google Meet or Zoom appointments."]].map(([Icon,title,text]: any) => <div key={title} className="glass-panel rounded-2xl p-6"><Icon className="text-neon-gold" /><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 text-sm text-muted-foreground">{text}</p></div>)}</div></section>

      <footer className="border-t border-border/50 bg-background/90 px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4"><div><img src={logo} alt="WDP Host" className="h-16 w-16 rounded-xl object-cover" /><p className="mt-4 text-sm text-muted-foreground">WDP Host — hosting, domains, email and websites for growing businesses.</p></div><div><h3 className="font-bold">Navigation</h3><div className="mt-3 grid gap-2 text-sm text-muted-foreground">{navItems.map((item) => <a key={item} href={`#${toSectionId(item)}`}>{item}</a>)}</div></div><div><h3 className="font-bold">Contact</h3><p className="mt-3 text-sm text-muted-foreground">www.wdphost.com<br />support@wdphost.com<br />WhatsApp: +27 81 215 9792</p></div><div><h3 className="font-bold">Next automation</h3><p className="mt-3 text-sm text-muted-foreground">WHMCS, DirectAdmin, registrar API, PayFast and billing automation will connect here when credentials are ready.</p></div></div><p className="mx-auto mt-10 max-w-7xl border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">Website designed by www.webdevpro.tech</p></footer>
      <WhatsAppAssistant />
      <InstallPrompt />
    </main>
  );
};

export default Index;
