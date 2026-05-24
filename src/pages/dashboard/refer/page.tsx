import { Copy, Gift, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";

export default function ReferPage() {
  const copy = async () => {
    await navigator.clipboard.writeText("https://creatordm.app/r/ram");
    toast.success("Referral link copied");
  };

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-6 lg:px-10">
      <section className="rounded-[22px] bg-[#5144e8] p-8 text-white shadow-lg shadow-[#5144e8]/20">
        <Gift className="h-8 w-8" />
        <h1 className="mt-6 text-4xl font-bold">Refer creators. Earn credits.</h1>
        <p className="mt-3 max-w-2xl text-white/80">Invite influencers, coaches, and agencies. Earn platform credits when they activate a paid plan.</p>
        <div className="mt-7 flex flex-col gap-3 rounded-2xl bg-white p-3 sm:flex-row">
          <div className="flex-1 rounded-xl bg-[#f4f1fb] px-4 py-3 font-mono text-sm text-[#171126]">https://creatordm.app/r/ram</div>
          <Button className="rounded-xl bg-[#171126] hover:bg-black" onClick={copy}>
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["0", "Invited creators", Users],
          ["₹0", "Credits earned", Gift],
          ["Ready", "Referral status", Share2],
        ].map(([value, label, Icon]) => (
          <section key={label as string} className="rounded-[18px] border border-[#dfdbea] bg-white p-6 shadow-sm">
            <Icon className="h-5 w-5 text-[#6d48ff]" />
            <p className="mt-4 text-3xl font-bold">{value as string}</p>
            <p className="text-sm text-[#82799b]">{label as string}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
