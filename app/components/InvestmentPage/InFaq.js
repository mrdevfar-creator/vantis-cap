"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How quickly can you deliver a project?",
    answer:
      "Most projects are delivered within 2–4 weeks depending on scope. We follow a sprint-based workflow, so you get working deliverables early and often — not one big reveal at the end.",
    tag: "Delivery",
  },
  {
    question: "Do you offer post-launch support?",
    answer:
      "Absolutely. Every project includes 30 days of complimentary post-launch support. After that, we offer flexible retainer plans so your product keeps running smoothly as it scales.",
    tag: "Support",
  },
  {
    question: "What technologies do you work with?",
    answer:
      "We specialize in modern stacks — Next.js, React, Tailwind CSS, Node.js, and cloud infrastructure on AWS and Vercel. We pick the right tool for your specific needs, not the trendy one.",
    tag: "Tech",
  },
  {
    question: "How does pricing work?",
    answer:
      "We offer fixed-price project packages and monthly retainer plans. Everything is scoped upfront — no surprise invoices, no scope creep charges. What we quote is what you pay.",
    tag: "Pricing",
  },
  {
    question: "Can I see examples of your previous work?",
    answer:
      "Yes. We have a curated portfolio of case studies covering SaaS platforms, e-commerce solutions, and enterprise dashboards. Reach out and we'll share the most relevant examples for your industry.",
    tag: "Portfolio",
  },
  {
    question: "How do we get started?",
    answer:
      "Simply book a free 30-minute discovery call. We'll discuss your goals, timeline, and budget — then send you a detailed proposal within 48 hours. No commitment required.",
    tag: "Onboarding",
  },
];

const accentColors = [
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-sky-500",
];

export default function InFaq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="bg-[#F9F8F6] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-black/5 border border-black/10 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              <span className="text-xs font-medium text-gray-500 tracking-widest uppercase">
                FAQ
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-gray-900">
              Questions we{" "}
              <span className="relative">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                  get asked
                </span>
                <span className="absolute bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 to-orange-400 opacity-30 rounded-full"></span>
              </span>
            </h2>
          </div>
          <p className="text-gray-500 text-base leading-relaxed max-w-sm lg:text-right">
            Can&apos;t find what you&apos;re looking for? Reach out directly —
            we reply within 2 hours on business days.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            const accent = accentColors[i % accentColors.length];

            return (
              <div
                key={i}
                onClick={() => toggle(i)}
                className={`group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-white border-black/10 shadow-lg shadow-black/5"
                    : "bg-white/60 border-black/[0.06] hover:bg-white hover:border-black/10 hover:shadow-md hover:shadow-black/5"
                }`}
              >
                <div className="p-7">
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center shadow-sm`}
                      >
                        <span className="text-white text-xs font-bold">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 leading-snug">
                        {faq.question}
                      </h3>
                    </div>

                    {/* Toggle Icon */}
                    <div
                      className={`shrink-0 mt-0.5 w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 ${
                        isOpen
                          ? "bg-gray-900 border-gray-900"
                          : "bg-transparent border-black/15 group-hover:border-black/30"
                      }`}
                    >
                      <svg
                        className={`w-3 h-3 transition-all duration-300 ${isOpen ? "text-white rotate-45" : "text-gray-400"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Answer */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-48 mt-5" : "max-h-0"}`}
                  >
                    <p className="text-gray-500 text-sm leading-relaxed pl-12">
                      {faq.answer}
                    </p>
                    <div className="pl-12 mt-4">
                      <span
                        className={`inline-block text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${accent} text-white`}
                      >
                        #{faq.tag}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <p className="text-gray-400 text-sm">Still have questions?</p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-700 transition-colors"
          >
            Contact Us
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
