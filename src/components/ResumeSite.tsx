import { useState } from "react";
import { Check, CheckCircle2, Play, User } from "lucide-react";

const videoLinks = [
  { title: "Shannon's Highlight Reel", url: "https://youtu.be/TiNkR4_L0KM", role: "Showcase", network: "Featured" },
  { title: "The Truth With Jeff Johnson", url: "https://youtu.be/4FcOwmbnbbE", role: "Supervising Producer", network: "BET" },
  { title: "I Married a Baller", url: "https://youtu.be/IQs4N6SUoSk", role: "Creator / EP", network: "TV One" },
  { title: "Girls Cruise Promo", url: "https://youtu.be/icD-4qEpu_E", role: "Story Producer", network: "VH1" },
  { title: "One Million Black Women", url: "https://youtu.be/D_nwXaYF7Oo", role: "Segment Producer", network: "Goldman Sachs" },
];

const stats = [
  { v: "25+", l: "Years" },
  { v: "$1M+", l: "Budgets" },
  { v: "75%", l: "Efficiency" },
  { v: "Emmy", l: "Credit" },
];

export function ResumeSite() {
  const [activeTab, setActiveTab] = useState<"summary" | "portfolio" | "contact">("summary");
  const [formStatus, setFormStatus] = useState<null | "sending" | "success">(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");
    setTimeout(() => setFormStatus("success"), 1500);
  };

  return (
    <div
      className="min-h-screen text-slate-200"
      style={{ backgroundColor: "#0F172A", fontFamily: "Inter, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        .resume-serif { font-family: 'Playfair Display', serif; }
        .resume-gold-gradient { background: linear-gradient(90deg, #C5A059 0%, #F1D592 50%, #C5A059 100%); }
        .resume-gold-text { color: #F1D592; }
        .resume-card-bg { background-color: #1E293B; }
      `}</style>

      <header className="relative border-b py-16 px-6 overflow-hidden" style={{ borderColor: "rgba(197,160,89,0.3)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[200%] bg-[radial-gradient(circle_at_center,#C5A059,transparent_70%)]" />
        </div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-48 h-64 border-2 p-2 rounded shadow-2xl rotate-[-2deg] flex items-center justify-center" style={{ borderColor: "#C5A059", backgroundColor: "#1E293B" }}>
            <User size={80} style={{ color: "#C5A059" }} />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-5xl md:text-7xl font-bold resume-serif mb-2 uppercase">
              Shannon J. <span className="resume-gold-text">Love</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 tracking-[0.2em] uppercase font-light mb-6">
              Creative Director • Executive Producer • Showrunner
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <a href="https://shannonjlove.tv" target="_blank" rel="noreferrer" className="resume-gold-gradient text-black px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:scale-105 transition">View Reel</a>
              <button onClick={() => setActiveTab("contact")} className="border resume-gold-text px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-[#C5A059]/10 transition" style={{ borderColor: "#C5A059" }}>
                Contact Me
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-50 backdrop-blur border-b" style={{ backgroundColor: "rgba(15,23,42,0.9)", borderColor: "rgba(197,160,89,0.2)" }}>
        <div className="max-w-6xl mx-auto px-6 flex justify-center gap-8 md:gap-16">
          {(["summary", "portfolio", "contact"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-5 uppercase text-[10px] font-bold tracking-[0.3em] transition ${
                activeTab === tab ? "resume-gold-text border-b-2" : "text-slate-500"
              }`}
              style={activeTab === tab ? { borderColor: "#C5A059" } : undefined}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {activeTab === "summary" && (
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-8">
              <h2 className="text-3xl resume-serif resume-gold-text italic">Executive Vision</h2>
              <p className="text-xl leading-relaxed font-light text-slate-300">
                Driving 25+ years of high-impact storytelling for global giants like{" "}
                <span className="text-white font-semibold">VH1, BET, MTV, and Goldman Sachs</span>. A creative architect who scales reach to{" "}
                <span className="text-white font-semibold">10M+ organically</span> and masters the intersection of entertainment and financial marketing.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {stats.map((s, i) => (
                  <div key={i} className="resume-card-bg p-6 border-l-2 rounded text-center" style={{ borderColor: "#C5A059" }}>
                    <div className="resume-gold-text text-2xl font-bold">{s.v}</div>
                    <div className="text-[10px] uppercase text-slate-500 tracking-tighter">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="resume-card-bg p-8 rounded border border-white/5">
                <h3 className="resume-gold-text uppercase text-[10px] font-bold tracking-widest mb-4">Core Expertise</h3>
                <ul className="space-y-3 text-sm">
                  {["IP Development", "Showrunning", "SEC Compliance", "C-Suite Comms"].map((x) => (
                    <li key={x} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="resume-gold-text" /> {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoLinks.map((v, i) => (
              <a key={i} href={v.url} target="_blank" rel="noreferrer" className="resume-card-bg p-6 rounded border border-white/5 group hover:border-[#C5A059]/50 transition relative block">
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-100 transition">
                  <Play size={30} className="resume-gold-text" />
                </div>
                <span className="text-[10px] resume-gold-text font-bold uppercase">{v.network}</span>
                <h4 className="text-lg font-bold text-white mt-1">{v.title}</h4>
                <p className="text-slate-400 text-xs italic">{v.role}</p>
              </a>
            ))}
          </div>
        )}

        {activeTab === "contact" && (
          <div className="max-w-2xl mx-auto resume-card-bg p-10 rounded-lg border shadow-2xl" style={{ borderColor: "rgba(197,160,89,0.2)" }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl resume-serif resume-gold-text mb-2 italic">Let's Build Something True</h2>
              <p className="text-slate-400 text-sm">Direct message for project inquiries or creative leadership.</p>
            </div>
            {formStatus === "success" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Message Delivered</h3>
                <p className="text-slate-400 mt-2">I'll get back to you shortly.</p>
                <button onClick={() => setFormStatus(null)} className="mt-6 resume-gold-text text-xs font-bold uppercase tracking-widest underline">
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Name</label>
                    <input required className="w-full bg-slate-900 border border-slate-700 p-3 rounded focus:border-[#C5A059] outline-none transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Email</label>
                    <input required type="email" className="w-full bg-slate-900 border border-slate-700 p-3 rounded focus:border-[#C5A059] outline-none transition" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Message</label>
                  <textarea required rows={4} className="w-full bg-slate-900 border border-slate-700 p-3 rounded focus:border-[#C5A059] outline-none transition" />
                </div>
                <button
                  type="submit"
                  disabled={formStatus === "sending"}
                  className="w-full resume-gold-gradient text-black py-4 rounded font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50"
                >
                  {formStatus === "sending" ? "Transmitting..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        )}
      </main>

      <footer className="border-t py-12 text-center text-slate-600 text-xs tracking-widest uppercase" style={{ borderColor: "rgba(197,160,89,0.1)" }}>
        &copy; {new Date().getFullYear()} Shannon J. Love • Executive Leadership
      </footer>
    </div>
  );
}
