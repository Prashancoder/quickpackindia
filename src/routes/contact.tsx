import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { FormEvent, useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      {
        title: "Contact Quickpack India | Get a Packaging Quote",
      },
      {
        name: "description",
        content:
          "Contact Quickpack India for custom corrugated boxes, mailer boxes, mono cartons, paper bags and packaging solutions. Get a tailored quote for your packaging requirements.",
      },
      {
        property: "og:title",
        content: "Contact Quickpack India | Get a Packaging Quote",
      },
      {
        property: "og:description",
        content:
          "Tell Quickpack India your packaging needs and get a tailored quote from our team.",
      },
      {
        property: "og:type",
        content: "website",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "/contact",
      },
    ],
  }),

  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/xjyvakwp", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setSubmitted(true);
        form.reset();
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch {
      alert("Unable to submit your enquiry. Please try again.");
    }
  };

  return (
    <main className="bg-[#f8f5ef] text-[#171717]">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8f5ef] via-[#f8f5ef] to-[#eadfce]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="max-w-4xl">
            <div className="mb-7 inline-flex items-center rounded-full border border-[#d8c7ad] bg-[#efe4d1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b4a00]">
              Get In Touch
            </div>

            <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] md:text-6xl lg:text-7xl">
              Let's pack your{" "}
              <span className="text-[#c86100]">next idea.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#62605b] md:text-xl">
              Tell us your packaging needs and we'll respond within hours with
              a tailored quote.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT + FORM */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          {/* LEFT SIDE */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#c86100]">
              Contact Us
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-[-0.03em] md:text-5xl">
              We'd love to hear from you.
            </h2>

            <div className="mt-10 space-y-4">
              {/* ADDRESS */}
              <div className="rounded-2xl border border-[#ded6ca] bg-white p-6">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1e2ce] text-[#c86100]">
                    <MapPin size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold">Visit Us</h3>

                    <p className="mt-2 text-sm leading-6 text-[#68645d]">
                      4/46 Gautam Gali,
                      <br />
                      New Vishwas Nagar,
                      <br />
                      Delhi - 110032
                    </p>
                  </div>
                </div>
              </div>

              {/* PHONE */}
              <div className="rounded-2xl border border-[#ded6ca] bg-white p-6">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1e2ce] text-[#c86100]">
                    <Phone size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold">Call Us</h3>

                    <div className="mt-2 space-y-1 text-sm">
                      <a
                        href="tel:+918700464213"
                        className="block font-medium text-[#c86100] hover:underline"
                      >
                        +91 87004 64213
                      </a>

                      <a
                        href="tel:+919871002637"
                        className="block font-medium text-[#c86100] hover:underline"
                      >
                        +91 98710 02637
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* EMAIL */}
              <div className="rounded-2xl border border-[#ded6ca] bg-white p-6">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1e2ce] text-[#c86100]">
                    <Mail size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold">Email Us</h3>

                    <a
                      href="mailto:ps985094@gmail.com"
                      className="mt-2 block break-all text-sm font-medium text-[#c86100] hover:underline"
                    >
                      ps985094@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* WHATSAPP */}
              <a
                href="https://wa.me/918700464213?text=Hi%20Quickpack%20India%2C%20I%27d%20like%20a%20quote."
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl bg-[#171717] p-6 text-white transition hover:bg-[#252525]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c86100]">
                    <MessageCircle size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold">WhatsApp Now</h3>

                    <p className="mt-1 text-sm text-white/60">
                      Fastest way to reach us
                    </p>
                  </div>
                </div>

                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>

              {/* HOURS */}
              <div className="flex items-center gap-4 rounded-2xl border border-[#ded6ca] bg-white p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1e2ce] text-[#c86100]">
                  <Clock3 size={21} />
                </div>

                <div>
                  <h3 className="font-bold">Business Hours</h3>

                  <p className="mt-1 text-sm text-[#68645d]">
                    Mon – Sat: 9:30 AM – 7:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-[2rem] border border-[#ded6ca] bg-white p-7 shadow-sm md:p-10">
            {submitted ? (
              <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f1e2ce] text-[#c86100]">
                  <MessageCircle size={30} />
                </div>

                <h2 className="mt-6 text-3xl font-bold">
                  Thank You!
                </h2>

                <p className="mt-4 max-w-md text-base leading-7 text-[#68645d]">
                  Your enquiry has been received successfully. Our team will
                  get back to you shortly with a tailored quote.
                </p>

                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-8 rounded-xl bg-[#c86100] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#ad5300]"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#c86100]">
                    Get a Quote
                  </p>

                  <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                    Tell us what you need.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[#77716a]">
                    Share your packaging requirements and we'll get back to you
                    with the right solution.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-5"
                >
                  {/* HIDDEN SUBJECT */}
                  <input
                    type="hidden"
                    name="_subject"
                    value="New Packaging Enquiry - Quickpack India"
                  />

                  {/* NAME + COMPANY */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-semibold"
                      >
                        Your Name *
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Enter your name"
                        className="w-full rounded-xl border border-[#dcd4c8] bg-[#faf9f6] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#aaa49b] focus:border-[#c86100] focus:ring-2 focus:ring-[#c86100]/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="company"
                        className="mb-2 block text-sm font-semibold"
                      >
                        Company Name
                      </label>

                      <input
                        id="company"
                        name="company"
                        type="text"
                        placeholder="Your company"
                        className="w-full rounded-xl border border-[#dcd4c8] bg-[#faf9f6] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#aaa49b] focus:border-[#c86100] focus:ring-2 focus:ring-[#c86100]/10"
                      />
                    </div>
                  </div>

                  {/* EMAIL + PHONE */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-semibold"
                      >
                        Email Address *
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@company.com"
                        className="w-full rounded-xl border border-[#dcd4c8] bg-[#faf9f6] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#aaa49b] focus:border-[#c86100] focus:ring-2 focus:ring-[#c86100]/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-semibold"
                      >
                        Phone Number *
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full rounded-xl border border-[#dcd4c8] bg-[#faf9f6] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#aaa49b] focus:border-[#c86100] focus:ring-2 focus:ring-[#c86100]/10"
                      />
                    </div>
                  </div>

                  {/* PRODUCT */}
                  <div>
                    <label
                      htmlFor="product"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Packaging Type
                    </label>

                    <select
                      id="product"
                      name="packaging_type"
                      className="w-full rounded-xl border border-[#dcd4c8] bg-[#faf9f6] px-4 py-3.5 text-sm outline-none transition focus:border-[#c86100] focus:ring-2 focus:ring-[#c86100]/10"
                    >
                      <option value="">Select packaging type</option>
                      <option value="Corrugated Boxes">
                        Corrugated Boxes
                      </option>
                      <option value="Pizza Boxes">Pizza Boxes</option>
                      <option value="Mailer Boxes">Mailer Boxes</option>
                      <option value="Mono Cartons">Mono Cartons</option>
                      <option value="Paper Bags">Paper Bags</option>
                      <option value="Custom Packaging">
                        Custom Packaging
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* QUANTITY */}
                  <div>
                    <label
                      htmlFor="quantity"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Approx. Quantity
                    </label>

                    <input
                      id="quantity"
                      name="quantity"
                      type="text"
                      placeholder="e.g. 5,000 boxes"
                      className="w-full rounded-xl border border-[#dcd4c8] bg-[#faf9f6] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#aaa49b] focus:border-[#c86100] focus:ring-2 focus:ring-[#c86100]/10"
                    />
                  </div>

                  {/* MESSAGE */}
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Your Requirement *
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      placeholder="Tell us about your box size, material, printing, quantity, delivery location, etc."
                      className="w-full resize-none rounded-xl border border-[#dcd4c8] bg-[#faf9f6] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#aaa49b] focus:border-[#c86100] focus:ring-2 focus:ring-[#c86100]/10"
                    />
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#c86100] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#ad5300]"
                  >
                    Send Enquiry
                    <ArrowRight size={18} />
                  </button>

                  <p className="text-center text-xs leading-5 text-[#8a857e]">
                    We'll use your information only to respond to your
                    packaging enquiry.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#171717] px-7 py-14 text-white md:px-12 md:py-16 lg:px-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#c86100]/20 blur-3xl" />

          <div className="relative max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e58a35]">
              Quickpack India
            </p>

            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.03em] md:text-5xl">
              Packaging that protects your business.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
              From corrugated boxes to custom cartons and paper bags, we help
              businesses create reliable packaging solutions.
            </p>

            <a
              href="https://wa.me/918700464213?text=Hi%20Quickpack%20India%2C%20I%27d%20like%20a%20quote."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#c86100] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#ad5300]"
            >
              WhatsApp Us
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}