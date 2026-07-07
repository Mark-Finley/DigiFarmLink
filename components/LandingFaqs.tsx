"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export default function LandingFaqs() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      question: "How do farmers upload crops without a stable internet connection?",
      answer: "DigiFarmLink Ghana includes a built-in offline synchronization engine. Farmers can list crops, set pricing, and save details locally on their device. The system queues the listing and automatically uploads it to Supabase as soon as a cellular network or internet connection is restored.",
    },
    {
      question: "How is vegetable freshness verified in the marketplace?",
      answer: "Crops are categorized into three freshness tiers (Fresh, Good, Fair) during listing, along with harvest dates. The Smart Recommendation algorithm ranks listings based on both proximity (closer farms) and harvest freshness, giving buyers high-fidelity choices.",
    },
    {
      question: "Who coordinates and pays for transport/logistics?",
      answer: "When a buyer checks out, logistics requests are automatically broadcast to the transporter network. Local transporters view pickup and delivery coordinates on Ashanti Corridor maps, accept the transit job, and receive automated fare payouts once the buyer confirms safe delivery.",
    },
    {
      question: "Which towns are supported in the Ashanti Region supply corridor?",
      answer: "We support major municipalities including Kumasi, Obuasi, Mampong, Konongo, Ejura, Bekwai, and Offinso. Each town is mapped to precise coordinates, enabling accurate distance calculation and optimal routing without relying on external geocoding APIs.",
    },
    {
      question: "Are payment payouts automated or manual?",
      answer: "In this MVP version, order prices and transportation fares are logged in the database upon acceptance. Cash or mobile money transactions are completed directly between stakeholders, and order statuses are updated in the dashboard to maintain a clean ledger.",
    },
  ];

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {faqs.map((faq, idx) => {
        const isOpen = activeIndex === idx;
        return (
          <div
            key={idx}
            className="border bg-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-sm"
          >
            <button
              onClick={() => toggleFaq(idx)}
              className="w-full flex items-center justify-between p-5 text-left text-foreground hover:bg-muted/30 transition-colors"
            >
              <span className="font-semibold text-base flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                {faq.question}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "max-h-96 opacity-100 border-t" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-5 text-sm text-muted-foreground leading-relaxed bg-muted/10">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
