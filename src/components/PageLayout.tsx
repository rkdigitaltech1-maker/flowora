import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { motion, AnimatePresence } from "motion/react";

function Instagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function Twitter(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function Youtube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
    </svg>
  );
}

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mouseVisible, setMouseVisible] = useState(false);

  // Scroll detection for Navbar transparency/blur toggle
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Spotlight mouse listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setMouseVisible(true);
    };
    const handleMouseLeave = () => {
      setMouseVisible(false);
    };
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col justify-between font-sans text-slate-800 antialiased selection:bg-purple-100 selection:text-purple-600">
      
      {/* ── MOUSE SPOTLIGHT (mix-blend-screen blur bubble) ── */}
      {mouseVisible && (
        <motion.div
          className="fixed pointer-events-none z-50 mix-blend-screen hidden lg:block"
          animate={{
            x: mousePos.x - 250,
            y: mousePos.y - 250,
          }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 200,
          }}
        >
          <div className="w-[500px] h-[500px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
        </motion.div>
      )}

      {/* ── HEADER NAVBAR ── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50" : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer shrink-0">
            <img src="/logo.png" alt="Flowora Logo" className="h-8 md:h-9 w-auto object-contain" />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How It Works", "Testimonials", "Pricing", "FAQ"].map((n) => {
              const isPricing = n === "Pricing";
              const hash = n.toLowerCase().replace(/ /g, "-");
              return (
                <a
                  key={n}
                  href={isPricing ? "/pricing" : `/#${hash}`}
                  className="text-gray-600 hover:text-gray-900 font-semibold relative group transition-colors text-sm"
                >
                  {n}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
                </a>
              );
            })}
          </div>

          {/* CTA Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link to="/login">
              <Button className="rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 text-white px-6 h-10 text-xs font-semibold shadow-md cursor-pointer transition-all">
                Start Free
              </Button>
            </Link>
          </div>

          {/* Mobile menu hamburger */}
          <button
            className="md:hidden text-slate-700 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 pb-6 space-y-4 pt-4 shadow-lg animate-fade-in">
            {["Features", "How It Works", "Testimonials", "Pricing", "FAQ"].map((n) => {
              const isPricing = n === "Pricing";
              const hash = n.toLowerCase().replace(/ /g, "-");
              return (
                <a
                  key={n}
                  href={isPricing ? "/pricing" : `/#${hash}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors"
                >
                  {n}
                </a>
              );
            })}
            <hr className="border-slate-100" />
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-sm font-bold text-slate-600 hover:text-slate-950 py-2"
              >
                Sign In
              </Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button className="w-full rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-extrabold h-11 text-sm shadow-md">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </motion.nav>

      {/* ── CONTENT CONTAINER ── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-gradient-to-b from-[#f8f7fc] to-white text-gray-600 pt-16 pb-6 px-6 relative overflow-hidden border-t border-gray-100">
        {/* Large watermark brand name background */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none overflow-hidden w-full flex justify-center">
          <span className="text-[12rem] sm:text-[16rem] md:text-[20rem] lg:text-[24rem] font-black tracking-tighter bg-gradient-to-b from-blue-100/60 via-purple-100/40 to-transparent bg-clip-text text-transparent leading-none whitespace-nowrap translate-y-[30%]">
            flowora
          </span>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-12 gap-10 pb-12 border-b border-gray-200/80">
            <div className="md:col-span-4 space-y-4">
              <p className="text-sm text-gray-500">
                Operated by <span className="font-bold text-gray-800">Growthlinker Pvt Ltd</span>
              </p>
              <p className="text-sm text-gray-500">Jamshedpur, Jharkhand, India</p>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-800">Product</h4>
                <ul className="space-y-2.5 text-sm text-gray-500">
                  <li><a href="/#features" className="hover:text-gray-900 transition-colors">Features</a></li>
                  <li><a href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</a></li>
                  <li><a href="/#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a></li>
                  <li><a href="/#faq" className="hover:text-gray-900 transition-colors">FAQ</a></li>
                  <li><Link to="/about" className="hover:text-gray-900 transition-colors">About us</Link></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-800">Legal</h4>
                <ul className="space-y-2.5 text-sm text-gray-500">
                  <li><Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link></li>
                  <li><Link to="/refund" className="hover:text-gray-900 transition-colors">Refund & Cancellation</Link></li>
                  <li><Link to="/shipping" className="hover:text-gray-900 transition-colors">Shipping & Delivery</Link></li>
                  <li><Link to="/cookies" className="hover:text-gray-900 transition-colors">Cookie Policy</Link></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-800">Contact</h4>
                <ul className="space-y-2.5 text-sm text-gray-500">
                  <li><Link to="/contact" className="hover:text-gray-900 transition-colors">Contact us</Link></li>
                  <li><a href="mailto:support@flowora.com" className="hover:text-gray-900 transition-colors">support@flowora.com</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-gray-400">
            <p>&copy; {new Date().getFullYear()} Growthlinker Pvt Ltd. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-600 font-semibold">All systems operational</span>
              </span>
              <span className="text-gray-400">Uses official Meta Graph API &middot; Not affiliated with Meta</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out both;
        }
      `}</style>
    </div>
  );
}
