'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'How does real-time MT4 & MT5 auto-sync work?',
    answer:
      'We provide a lightweight Expert Advisor (ApexJournalSync.mq5 / .mq4). You drop it into your MetaTrader Experts folder and paste your secret API Key. Whenever an order opens, modifies, or closes, the EA transmits the ticket details to your private webhook in under 200 milliseconds. No manual entry needed!',
  },
  {
    question: 'Do I need to provide my broker password or login credentials?',
    answer:
      'Absolutely NOT. Unlike older sync tools that ask for your account password or investor password, our EA runs locally on your PC or VPS and pushes read-only execution events. You maintain 100% security and custody of your credentials at all times.',
  },
  {
    question: 'Is this compatible with prop firms like FTMO, FundedNext, and Apex?',
    answer:
      'Yes. Since ApexJournal connects via standard MetaTrader WebRequest protocols, it works seamlessly with any prop firm evaluation, funded account, or personal live broker (IC Markets, Pepperstone, etc.). It does not violate any prop firm rules.',
  },
  {
    question: 'Can I import my past historical trades?',
    answer:
      'Yes. In MetaTrader, right-click on your Account History, select "Save as Detailed Report" (CSV or HTML), and drop it into ApexJournal. Our statement parser will instantly ingest all historical trades, calculate pips and R:R, and populate your journal.',
  },
  {
    question: 'What is the "Cost of Mistakes" feature?',
    answer:
      'When you tag a losing trade with an emotional error (like #FOMO Entry or #Moved Stop Loss), ApexJournal isolates those trades and calculates exactly how much capital you surrendered to undisciplined executions. It also shows your "Theoretical Clean P&L" if you had followed your trading plan.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 px-6 max-w-[900px] mx-auto space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          Frequently Asked Questions
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Everything You Need to Know
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Have more questions? Our documentation and community are here to help.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.question}
              className="bg-[#0e131f] border border-[#1b2336] rounded-xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 px-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#131929]/50 transition-colors"
              >
                <span className="text-sm font-semibold text-slate-200">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="p-4 px-5 pt-0 text-xs text-slate-400 leading-relaxed border-t border-[#1b2336]/60 bg-[#090d16]/30">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
