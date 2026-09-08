import { Link } from "@tanstack/react-router";

export function CTASection({
  title,
  text,
  primaryLabel = "Get a Quote",
  secondaryLabel = "Contact Us",
}: {
  title: string;
  text: string;
  primaryLabel?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="container-page mt-20">
      <div className="rounded-2xl bg-ink px-6 py-12 text-center text-ink-foreground md:px-12 md:py-16">
        <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm opacity-80 md:text-base">{text}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/contact"
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {primaryLabel}
          </Link>
          <Link
            to="/contact"
            className="rounded-md border border-ink-foreground/30 px-6 py-3 text-sm font-semibold transition-colors hover:bg-ink-foreground/10"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
