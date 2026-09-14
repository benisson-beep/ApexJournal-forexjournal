'use client';

import React, { useState } from 'react';
import { CheckCircle2, Clock, Mail, MessageSquare, Send, ShieldCheck } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate instant submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 600);
  };

  return (
    <section id="contact" className="py-24 px-6 max-w-[1280px] mx-auto space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          Direct Support
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Get in Touch With Our Trading Desk
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Have a question about MT4/MT5 webhook integration, prop firm rules, or custom plans? We typically reply within 2 hours during market hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left: Contact Info & Support Channels (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Direct Communication Channels
            </h3>

            {/* Channel 1: Email */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#080c14] border border-white/10">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">Email Support</span>
                <span className="text-xs font-mono text-emerald-400">support@apexjournal.app</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Average reply: &lt; 2 hours</span>
              </div>
            </div>

            {/* Channel 2: Discord Lounge */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#080c14] border border-white/10">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">Trader Discord Lounge</span>
                <span className="text-xs font-mono text-slate-300">discord.gg/apexjournal</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Live EA setup help & community</span>
              </div>
            </div>

            {/* Channel 3: Response SLA */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#080c14] border border-white/10">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">Market Hours Coverage</span>
                <span className="text-xs text-slate-300">24/5 Sunday 5PM EST – Friday 5PM EST</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Active coverage through all Forex sessions</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Encrypted transmission. We never request your broker passwords.</span>
          </div>
        </div>

        {/* Right: Contact Form (3 Cols) */}
        <div className="lg:col-span-3 bg-black border border-white/10 rounded-2xl p-6 sm:p-8 relative">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-100">Message Received</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Thank you for reaching out! Our trading support desk will review your inquiry and get back to you shortly.
                </p>
              </div>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-emerald-400 underline hover:text-emerald-300 cursor-pointer pt-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full bg-[#080c14] border border-white/10 focus:border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@trader.com"
                    className="w-full bg-[#080c14] border border-white/10 focus:border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Inquiry Topic
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#080c14] border border-white/10 focus:border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none cursor-pointer"
                >
                  <option value="General Inquiry">General Inquiry / Feedback</option>
                  <option value="MT4/MT5 Integration">MT4 / MT5 EA Setup & Webhook Support</option>
                  <option value="Prop Firm Question">Prop Firm Compatibility (FTMO, FundedNext, Apex)</option>
                  <option value="Enterprise Desk">Enterprise / Prop Desk Team Plan ($79/mo)</option>
                  <option value="Feature Request">Feature Request / Bug Report</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our trading desk assist you today?"
                  className="w-full bg-[#080c14] border border-white/10 focus:border-emerald-500/50 rounded-lg p-3 text-xs text-slate-200 outline-none resize-none placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-[#080b11] font-bold text-xs px-6 py-3 rounded-lg transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending...' : 'Send Message to Desk'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
