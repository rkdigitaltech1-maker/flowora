import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout.tsx";
import { motion } from "motion/react";
import {
  ArrowRight, ArrowLeft, CheckCircle2, User, CreditCard,
  FileText, Rocket, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";


type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1: Personal Info
  fullName: string;
  email: string;
  phone: string;
  websiteUrl: string;
  // Promotion channels
  channels: string[];
  socialHandles: {
    instagram: string;
    youtube: string;
    twitter: string;
    linkedin: string;
  };
  // Step 2: Payment Info
  paymentMethod: "upi" | "paypal" | "bank_transfer" | "";
  upiId: string;
  paypalEmail: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  // Step 3: Agreement
  agreementAccepted: boolean;
  // Step 4: Complete
  affiliateCode: string;
}

const initialForm: FormData = {
  fullName: "",
  email: "",
  phone: "",
  websiteUrl: "",
  channels: [],
  socialHandles: { instagram: "", youtube: "", twitter: "", linkedin: "" },
  paymentMethod: "",
  upiId: "",
  paypalEmail: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  accountHolderName: "",
  agreementAccepted: false,
  affiliateCode: "",
};

const steps = [
  { number: 1, label: "Personal Info", icon: User },
  { number: 2, label: "Payment Details", icon: CreditCard },
  { number: 3, label: "Agreement", icon: FileText },
  { number: 4, label: "Launch", icon: Rocket },
];


const channelOptions = [
  { value: "social_media", label: "Social Media" },
  { value: "email", label: "Email Marketing" },
  { value: "blog", label: "Blog / Website" },
  { value: "youtube", label: "YouTube" },
  { value: "paid_ads", label: "Paid Ads" },
  { value: "community", label: "Communities / Groups" },
];

function generateAffiliateCode(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}${suffix}`;
}

export default function AffiliateApplyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = (updates: Partial<FormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const toggleChannel = (channel: string) => {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };


  const validateStep = (s: Step): boolean => {
    if (s === 1) {
      if (!form.fullName.trim()) { toast.error("Full name is required"); return false; }
      if (!form.email.trim() || !form.email.includes("@")) { toast.error("Valid email is required"); return false; }
      if (form.channels.length === 0) { toast.error("Select at least one promotion channel"); return false; }
      return true;
    }
    if (s === 2) {
      if (!form.paymentMethod) { toast.error("Select a payment method"); return false; }
      if (form.paymentMethod === "upi" && !form.upiId.trim()) { toast.error("UPI ID is required"); return false; }
      if (form.paymentMethod === "paypal" && !form.paypalEmail.trim()) { toast.error("PayPal email is required"); return false; }
      if (form.paymentMethod === "bank_transfer") {
        if (!form.bankName.trim() || !form.accountNumber.trim() || !form.ifscCode.trim()) {
          toast.error("All bank details are required"); return false;
        }
      }
      return true;
    }
    if (s === 3) {
      if (!form.agreementAccepted) { toast.error("Please accept the affiliate agreement"); return false; }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    if (step < 4) setStep((step + 1) as Step);
  };

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as Step);
  };


  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setIsSubmitting(true);

    // Generate affiliate code
    const code = generateAffiliateCode(form.fullName);
    updateForm({ affiliateCode: code });

    // Simulate API call (in production this would call Supabase)
    await new Promise((r) => setTimeout(r, 2000));

    setIsSubmitting(false);
    setStep(4);
    toast.success("Application submitted successfully!");
  };

  return (
    <PageLayout>
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">
              Join the Affiliate Program
            </h1>
            <p className="text-gray-500 mt-2">
              Complete the form below to get your unique referral link
            </p>
          </div>

          {/* Step Progress */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {steps.map((s, i) => (
              <div key={s.number} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all ${
                  step >= s.number
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {step > s.number ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <s.icon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${step > s.number ? "bg-purple-300" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>


          {/* Step 1: Personal Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-6">Personal Information</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => updateForm({ fullName: e.target.value })}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm({ email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone (optional)</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateForm({ phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Website / Blog URL (optional)</label>
                  <input
                    type="url"
                    value={form.websiteUrl}
                    onChange={(e) => updateForm({ websiteUrl: e.target.value })}
                    placeholder="https://yoursite.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                  />
                </div>


                {/* Promotion Channels */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">How will you promote? *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {channelOptions.map((ch) => (
                      <button
                        key={ch.value}
                        type="button"
                        onClick={() => toggleChannel(ch.value)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          form.channels.includes(ch.value)
                            ? "bg-purple-50 border-purple-300 text-purple-700"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Social Handles */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Social Handles (optional)</label>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={form.socialHandles.instagram}
                      onChange={(e) => updateForm({ socialHandles: { ...form.socialHandles, instagram: e.target.value } })}
                      placeholder="@instagram_handle"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 outline-none text-sm"
                    />
                    <input
                      type="text"
                      value={form.socialHandles.youtube}
                      onChange={(e) => updateForm({ socialHandles: { ...form.socialHandles, youtube: e.target.value } })}
                      placeholder="YouTube channel URL"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}


          {/* Step 2: Payment Details */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-2">Payment Details</h2>
              <p className="text-gray-500 text-sm mb-6">Choose how you want to receive your commissions</p>

              <div className="space-y-5">
                {/* Payment Method Selection */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "upi", label: "UPI", desc: "Instant transfer" },
                    { value: "paypal", label: "PayPal", desc: "International" },
                    { value: "bank_transfer", label: "Bank Transfer", desc: "Direct deposit" },
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => updateForm({ paymentMethod: method.value as any })}
                      className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        form.paymentMethod === method.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-bold text-sm text-slate-800">{method.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{method.desc}</p>
                    </button>
                  ))}
                </div>

                {/* UPI Fields */}
                {form.paymentMethod === "upi" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">UPI ID *</label>
                    <input
                      type="text"
                      value={form.upiId}
                      onChange={(e) => updateForm({ upiId: e.target.value })}
                      placeholder="yourname@upi"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                    />
                  </div>
                )}


                {/* PayPal Fields */}
                {form.paymentMethod === "paypal" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">PayPal Email *</label>
                    <input
                      type="email"
                      value={form.paypalEmail}
                      onChange={(e) => updateForm({ paypalEmail: e.target.value })}
                      placeholder="your@paypal.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                    />
                  </div>
                )}

                {/* Bank Transfer Fields */}
                {form.paymentMethod === "bank_transfer" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Holder Name *</label>
                      <input
                        type="text"
                        value={form.accountHolderName}
                        onChange={(e) => updateForm({ accountHolderName: e.target.value })}
                        placeholder="Full name as on bank account"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 outline-none text-sm"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bank Name *</label>
                        <input
                          type="text"
                          value={form.bankName}
                          onChange={(e) => updateForm({ bankName: e.target.value })}
                          placeholder="e.g., HDFC Bank"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">IFSC Code *</label>
                        <input
                          type="text"
                          value={form.ifscCode}
                          onChange={(e) => updateForm({ ifscCode: e.target.value })}
                          placeholder="e.g., HDFC0001234"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Number *</label>
                      <input
                        type="text"
                        value={form.accountNumber}
                        onChange={(e) => updateForm({ accountNumber: e.target.value })}
                        placeholder="Your bank account number"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 outline-none text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Your payment information is encrypted and secure. We never share your financial details with third parties.
                  </p>
                </div>
              </div>
            </motion.div>
          )}


          {/* Step 3: Agreement */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-2">Affiliate Agreement</h2>
              <p className="text-gray-500 text-sm mb-6">Please read and accept the terms of our affiliate program</p>

              <div className="bg-gray-50 rounded-xl p-5 max-h-80 overflow-y-auto text-sm text-gray-600 leading-relaxed space-y-4 border border-gray-100">
                <h3 className="font-bold text-slate-800">Flowora Affiliate Program Agreement v1.0</h3>
                
                <p><strong>1. Commission Structure:</strong> You will receive 25% commission on all subscription payments made by customers you refer for the first 11 months of their subscription. Commission is calculated on the net payment amount (excluding taxes and processing fees).</p>
                
                <p><strong>2. Cookie Duration:</strong> Referral tracking uses a 30-day cookie window. If a referred visitor signs up within 30 days of clicking your link, the referral is attributed to you.</p>
                
                <p><strong>3. Payment Terms:</strong> Commissions are paid monthly. Minimum payout threshold is ₹500 INR or $10 USD. Payments are processed within 15 business days of the end of each month via your chosen payment method (UPI, PayPal, or bank transfer).</p>
                
                <p><strong>4. Prohibited Activities:</strong> Self-referrals, cookie stuffing, paid search brand bidding, spam, misleading advertising, and any fraudulent activities are strictly prohibited. Violation will result in immediate termination and forfeiture of unpaid commissions.</p>
                
                <p><strong>5. Content Guidelines:</strong> You may use our approved marketing materials, screenshots, and brand assets. You must not make false claims about Flowora's features, pricing, or capabilities. All promotional content must comply with applicable advertising regulations.</p>
                
                <p><strong>6. Termination:</strong> Either party may terminate this agreement at any time with 30 days written notice. Upon termination, you will receive payment for any earned and unpaid commissions. Flowora reserves the right to terminate accounts engaged in prohibited activities without notice.</p>
                
                <p><strong>7. Modifications:</strong> Flowora reserves the right to modify commission rates, cookie duration, and program terms with 30 days advance notice. Continued participation after the notice period constitutes acceptance of new terms.</p>
                
                <p><strong>8. Intellectual Property:</strong> You are granted a limited, non-exclusive license to use Flowora's brand assets solely for the purpose of promoting Flowora through your affiliate link. All intellectual property rights remain with Flowora.</p>
                
                <p><strong>9. Liability:</strong> Flowora is not liable for any indirect, incidental, or consequential damages. Maximum liability is limited to the total commissions earned in the 3 months preceding any claim.</p>
                
                <p><strong>10. Governing Law:</strong> This agreement is governed by the laws of India. Any disputes will be resolved through arbitration in Bangalore, India.</p>
              </div>

              <div className="mt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreementAccepted}
                    onChange={(e) => updateForm({ agreementAccepted: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-700">
                    I have read and agree to the <strong>Flowora Affiliate Program Agreement</strong>. I understand the commission structure, payment terms, and prohibited activities.
                  </span>
                </label>
              </div>
            </motion.div>
          )}


          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 shadow-sm text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Application Submitted!</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Your affiliate application is under review. We'll email you at{" "}
                <strong className="text-slate-700">{form.email}</strong> within 24 hours with your approval status.
              </p>

              <div className="bg-purple-50 rounded-xl p-6 mb-8 max-w-sm mx-auto">
                <p className="text-xs text-purple-500 font-bold uppercase mb-2">Your Affiliate Code (Preview)</p>
                <p className="text-2xl font-black text-purple-700">{form.affiliateCode || generateAffiliateCode(form.fullName)}</p>
                <p className="text-xs text-purple-400 mt-2">
                  Link: flowora.tech/ref/{form.affiliateCode || generateAffiliateCode(form.fullName)}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-500 font-medium">What happens next?</p>
                <div className="grid gap-2 text-left max-w-sm mx-auto">
                  {[
                    "We review your application (within 24 hours)",
                    "You receive approval email with dashboard access",
                    "Start sharing your link and earning commissions",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => navigate("/dashboard/affiliate")}
                className="mt-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 font-bold cursor-pointer"
              >
                Go to Affiliate Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}


          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-6">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="rounded-full px-6 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button
                  onClick={nextStep}
                  className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-6 cursor-pointer"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <Rocket className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
