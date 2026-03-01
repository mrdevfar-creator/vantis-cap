"use client";

import { useState } from "react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  const contactInfo = [
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      ),
      label: "Email Us",
      value: "support@yourfirm.com",
      accent: "from-amber-400 to-orange-500",
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
          />
        </svg>
      ),
      label: "Call Us",
      value: "+1 (800) 123-4567",
      accent: "from-emerald-400 to-teal-500",
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      label: "Response Time",
      value: "Within 2 hours",
      accent: "from-violet-400 to-purple-500",
    },
  ];

  return (
    <section className="relative bg-[#0D0D0D] min-h-screen overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Blobs */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 rounded-full bg-amber-500/8 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 rounded-full bg-emerald-500/8 blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">
              Contact Us
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Let&apos;s{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              talk
            </span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Have a question about your investment or want to get started? Our
            team is ready to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left — Contact Info */}
          <div className="space-y-4">
            {contactInfo.map((info) => (
              <div
                key={info.label}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.05] transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.accent} flex items-center justify-center text-white mb-4 shadow-md`}
                >
                  {info.icon}
                </div>
                <p className="text-gray-500 text-xs mb-1">{info.label}</p>
                <p className="text-white text-sm font-semibold">{info.value}</p>
              </div>
            ))}

            {/* Note */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <p className="text-gray-500 text-xs leading-relaxed">
                🔒 All communications are encrypted and handled with strict
                confidentiality. We never share your information with third
                parties.
              </p>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-bold mb-3">
                  Message Sent!
                </h3>
                <p className="text-gray-400 text-sm max-w-sm">
                  Thank you for reaching out, {formData.name}. We&apos;ll get
                  back to you at{" "}
                  <span className="text-white">{formData.email}</span> within 2
                  hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      subject: "",
                      message: "",
                    });
                  }}
                  className="mt-8 text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-4"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="text-gray-400 text-xs font-medium block mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Smith"
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-400/50 focus:bg-white/[0.07] transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-gray-400 text-xs font-medium block mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@email.com"
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-400/50 focus:bg-white/[0.07] transition-colors"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-gray-400 text-xs font-medium block mb-2">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-amber-400/50 transition-colors appearance-none"
                    style={{ color: formData.subject ? "#fff" : "#4b5563" }}
                  >
                    <option value="" disabled style={{ background: "#1a1a1a" }}>
                      Select a subject
                    </option>
                    <option
                      value="investment"
                      style={{ background: "#1a1a1a", color: "#fff" }}
                    >
                      Investment Inquiry
                    </option>
                    <option
                      value="account"
                      style={{ background: "#1a1a1a", color: "#fff" }}
                    >
                      Account Support
                    </option>
                    <option
                      value="withdrawal"
                      style={{ background: "#1a1a1a", color: "#fff" }}
                    >
                      Withdrawal Request
                    </option>
                    <option
                      value="partnership"
                      style={{ background: "#1a1a1a", color: "#fff" }}
                    >
                      Partnership
                    </option>
                    <option
                      value="other"
                      style={{ background: "#1a1a1a", color: "#fff" }}
                    >
                      Other
                    </option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="text-gray-400 text-xs font-medium block mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    rows={5}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-400/50 focus:bg-white/[0.07] transition-colors resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={
                    !formData.name || !formData.email || !formData.message
                  }
                  className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-bold rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  Send Message
                  <svg
                    className="w-4 h-4 inline ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>

                <p className="text-gray-600 text-xs text-center">
                  * Required fields. We reply within 2 business hours.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
