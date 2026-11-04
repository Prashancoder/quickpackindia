import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, User, ArrowLeft, ArrowRight, BookOpen, Share2, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const formatted = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      meta: [
        { title: `${formatted} | QuickPack India Packaging Guide` },
        { name: "description", content: `Read in-depth packaging advice on ${formatted}.` },
        { property: "og:title", content: `${formatted} | QuickPack India` },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const [blog, setBlog] = useState<any>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .getBlogBySlug(slug)
      .then((res) => {
        if (res.success && res.blog) {
          setBlog(res.blog);
          setRelatedBlogs(res.relatedBlogs || []);
        }
      })
      .catch((err) => {
        console.warn("Failed to load blog:", err);
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container-page py-16 max-w-4xl">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-3/4 rounded bg-surface" />
          <div className="h-4 w-1/4 rounded bg-surface" />
          <div className="h-96 rounded-2xl bg-surface" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">Article not found</h1>
        <p className="mt-2 text-muted-foreground">This blog article may have been moved or unpublished.</p>
        <Link
          to="/blog"
          className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          Back to Blog Guides
        </Link>
      </div>
    );
  }

  // Article JSON-LD schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.excerpt,
    image: blog.featuredImage || "https://quickpack.in/assets/corrugated-boxes.jpg",
    author: {
      "@type": "Person",
      name: blog.author || "QuickPack Editorial Team",
    },
    publisher: {
      "@type": "Organization",
      name: "QuickPack India",
      logo: {
        "@type": "ImageObject",
        url: "https://quickpack.in/logo.png",
      },
    },
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    mainEntityOfPage: `https://quickpack.in/blog/${blog.slug}`,
  };

  return (
    <div className="container-page py-10 md:py-16 max-w-4xl">
      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/blog" className="hover:text-primary">
              Blog
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          {blog.category && (
            <>
              <li>
                <span className="text-muted-foreground">{blog.category.name}</span>
              </li>
              <li aria-hidden="true">/</li>
            </>
          )}
          <li className="font-bold text-foreground truncate max-w-xs">{blog.title}</li>
        </ol>
      </nav>

      {/* Article Header */}
      <header className="mt-6">
        {blog.category && (
          <span className="text-xs font-bold tracking-wider text-primary uppercase">
            {blog.category.name}
          </span>
        )}

        <h1 className="mt-2 text-3xl font-black md:text-5xl text-foreground leading-[1.15]">
          {blog.title}
        </h1>

        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          {blog.excerpt}
        </p>

        <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground border-y border-border py-3">
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <User className="size-3.5 text-primary" />
            {blog.author}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {blog.readingTime || 5} min read
          </span>
          <span>•</span>
          <span>
            {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </header>

      {/* Featured Banner Image */}
      {blog.featuredImage && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border shadow-card aspect-16/9 bg-surface">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/corrugated-boxes.jpg";
            }}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Article Semantic HTML Content */}
      <article
        className="mt-10 prose prose-neutral max-w-none text-foreground leading-relaxed [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-6 [&>h3]:mb-2 [&>p]:mt-3 [&>p]:leading-7 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mt-3 [&>table]:w-full [&>table]:mt-4 [&>table]:border-collapse [&>table_th]:border [&>table_th]:border-border [&>table_th]:p-3 [&>table_th]:bg-surface [&>table_td]:border [&>table_td]:border-border [&>table_td]:p-3"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Recommended Products linked inside Blog */}
      {blog.relatedProducts && blog.relatedProducts.length > 0 && (
        <div className="mt-16 rounded-2xl border border-border bg-surface/50 p-6 sm:p-8">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Factory Products Mentioned in Article
          </span>
          <h3 className="mt-1 text-xl font-bold">Recommended Packaging Solutions</h3>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {blog.relatedProducts.map((p: any) => (
              <div
                key={p._id || p.slug}
                className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-4/3 overflow-hidden rounded-lg bg-surface p-2 mb-3">
                    <img
                      src={p.thumbnail || "/assets/corrugated-boxes.jpg"}
                      alt={p.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <h4 className="text-sm font-bold text-foreground hover:text-primary">
                    <Link to="/products/$slug" params={{ slug: p.slug }}>
                      {p.name}
                    </Link>
                  </h4>
                  <p className="text-xs font-extrabold text-primary mt-1">
                    From ₹{p.minPrice || p.basePrice}
                  </p>
                </div>

                <Link
                  to="/products/$slug"
                  params={{ slug: p.slug }}
                  className="mt-3 block text-center rounded-lg bg-primary py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
                >
                  Configure Size →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <section className="mt-16 border-t border-border pt-12">
          <h3 className="text-xl font-bold md:text-2xl">More Packaging Guides</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {relatedBlogs.map((rb) => (
              <Link
                key={rb._id || rb.slug}
                to="/blog/$slug"
                params={{ slug: rb.slug }}
                className="group rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-menu transition-shadow block"
              >
                <h4 className="text-sm font-bold group-hover:text-primary leading-snug">
                  {rb.title}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{rb.excerpt}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">
                  Read Guide <ArrowRight className="size-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
