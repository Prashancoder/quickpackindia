import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ArrowRight, Clock, User, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Packaging News, Guides & Industry Insights | QuickPack India" },
      {
        name: "description",
        content:
          "Read expert packaging guides on corrugated box selection, 3-ply vs 5-ply strength tests, custom mailer box unboxing, and logistics tips.",
      },
      { property: "og:title", content: "Packaging News & Guides | QuickPack India" },
      { property: "og:url", content: "/blog" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .getBlogs()
      .then((res) => {
        if (res.success && res.blogs) {
          setBlogs(res.blogs);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="container-page py-10 md:py-16">
      <header className="max-w-3xl">
        <span className="text-xs font-bold tracking-wider text-primary uppercase">
          Knowledge Base
        </span>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl text-foreground">
          Packaging News &amp; Educational Guides
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Learn how to optimize packaging dimensions, calculate burst strength, avoid courier volumetric surcharges, and design high-impact unboxing experiences.
        </p>
      </header>

      <div className="mt-10">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <article
                key={blog._id || blog.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-menu"
              >
                <Link
                  to="/blog/$slug"
                  params={{ slug: blog.slug }}
                  className="aspect-16/9 overflow-hidden bg-surface"
                >
                  <img
                    src={blog.featuredImage || "/assets/corrugated-boxes.jpg"}
                    alt={blog.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/corrugated-boxes.jpg";
                    }}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    {blog.category && (
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                        {blog.category.name}
                      </span>
                    )}
                    <h2 className="mt-2 text-base font-bold leading-snug group-hover:text-primary transition-colors">
                      <Link to="/blog/$slug" params={{ slug: blog.slug }}>
                        {blog.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {blog.readingTime || 5} min read
                    </span>
                    <Link
                      to="/blog/$slug"
                      params={{ slug: blog.slug }}
                      className="font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Read Article <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground text-xs">
            No published articles found.
          </div>
        )}
      </div>
    </div>
  );
}
