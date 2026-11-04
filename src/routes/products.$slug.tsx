import { useEffect, useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Heart,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Zap,
  PhoneCall,
  FileText,
  CheckCircle2,
  X,
  Maximize2,
  Clock,
  Layers,
  Sparkles,
  Building2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { api } from "@/lib/api";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => {
    const formattedTitle = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      meta: [
        {
          title: `${formattedTitle} | Factory Direct Packaging Manufacturer | QuickPack India`,
        },
        {
          name: "description",
          content: `Get best quote and manufacturing specifications for ${formattedTitle}. High quality packaging boxes manufactured to custom size, ply, and printing requirements. Pan-India dispatch.`,
        },
        { property: "og:title", content: `${formattedTitle} | QuickPack India` },
        { property: "og:type", content: "product" },
      ],
      links: [{ rel: "canonical", href: `/products/${params.slug}` }],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");

  // Lightbox modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Enquiry modal state
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryType, setEnquiryType] = useState<"REQUEST_CALLBACK" | "GET_QUOTE" | "INTERESTED">("GET_QUOTE");
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    customerName: "",
    mobileNumber: "",
    email: "",
    companyName: "",
    requiredQuantity: "",
    message: "",
  });

  // Variant selections (for products with ecommerce variants)
  const [selectedTopPaper, setSelectedTopPaper] = useState<string>("Brown");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(100);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);

  // PIN Code check state
  const [pincodeInput, setPincodeInput] = useState<string>("");
  const [pincodeResult, setPincodeResult] = useState<any>(null);
  const [pincodeLoading, setPincodeLoading] = useState<boolean>(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState<string>("");
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Stores
  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  useEffect(() => {
    setIsLoading(true);
    api
      .getProductBySlug(slug)
      .then((res) => {
        if (res.success && res.product) {
          setProduct(res.product);
          setVariants(res.variants || []);
          setReviews(res.reviews || []);
          setRelatedProducts(res.relatedProducts || []);
          setActiveImage(res.product.thumbnail || res.product.images?.[0]?.url || "/assets/corrugated-boxes.jpg");

          // Default enquiry MOQ if product has one
          if (res.product.minimumOrderQuantity) {
            setEnquiryForm((prev) => ({
              ...prev,
              requiredQuantity: prev.requiredQuantity || res.product.minimumOrderQuantity,
            }));
          }

          // Set default variant if available
          if (res.variants && res.variants.length > 0) {
            const first = res.variants[0];
            if (first.options?.topPaper) setSelectedTopPaper(first.options.topPaper);
            if (first.options?.packQuantity) setSelectedQuantity(Number(first.options.packQuantity));
          }
        }
      })
      .catch((err) => {
        console.warn("Failed to load product detail:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  const hasVariants = variants && variants.length > 0;

  // Derive unique papers and pack quantities if variants exist
  const availablePapers = useMemo(() => {
    if (!hasVariants) return [];
    const set = new Set<string>();
    variants.forEach((v) => {
      if (v.options?.topPaper) set.add(v.options.topPaper);
    });
    return Array.from(set);
  }, [variants, hasVariants]);

  const availableQuantities = useMemo(() => {
    if (!hasVariants) return [];
    const set = new Set<number>();
    variants.forEach((v) => {
      if (v.options?.packQuantity) set.add(v.options.packQuantity);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [variants, hasVariants]);

  // Active Variant lookup
  const activeVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variants.find(
      (v) =>
        v.options?.topPaper?.toLowerCase() === selectedTopPaper.toLowerCase() &&
        Number(v.options?.packQuantity) === Number(selectedQuantity)
    );
  }, [variants, hasVariants, selectedTopPaper, selectedQuantity]);

  // Pricing calculations
  const currentPackPrice = activeVariant ? activeVariant.price : (product?.basePrice || 0);
  const comparePackPrice = activeVariant?.compareAtPrice || product?.compareAtPrice;
  const unitPricePerBox =
    activeVariant?.unitPricePerBox ||
    (selectedQuantity > 0 && currentPackPrice > 0
      ? Math.round((currentPackPrice / selectedQuantity) * 100) / 100
      : product?.basePrice || 0);
  const savings = comparePackPrice && comparePackPrice > currentPackPrice ? comparePackPrice - currentPackPrice : 0;
  const totalPrice = Math.round(currentPackPrice * orderQuantity * 100) / 100;

  const isWishlisted = product ? isInWishlist(product._id) : false;

  // Open Enquiry Modal with specific action
  const handleOpenEnquiry = (type: "REQUEST_CALLBACK" | "GET_QUOTE" | "INTERESTED") => {
    setEnquiryType(type);
    let defaultMsg = "";
    if (type === "REQUEST_CALLBACK") {
      defaultMsg = `Hi, I would like to request a callback regarding ${product?.name}.`;
    } else if (type === "GET_QUOTE") {
      defaultMsg = `Please send your best factory quote for ${product?.name} (Required Quantity: ${enquiryForm.requiredQuantity || product?.minimumOrderQuantity || "4000 Piece"}).`;
    } else {
      defaultMsg = `Yes! I am interested in ordering ${product?.name}. Please share delivery timelines and sample options.`;
    }
    setEnquiryForm((prev) => ({
      ...prev,
      message: prev.message || defaultMsg,
      requiredQuantity: prev.requiredQuantity || product?.minimumOrderQuantity || "1000",
    }));
    setEnquiryModalOpen(true);
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.customerName.trim() || !enquiryForm.mobileNumber.trim() || !enquiryForm.email.trim() || !enquiryForm.requiredQuantity.trim()) {
      toast.error("Please fill in all required fields (Name, Mobile, Email, Required Quantity).");
      return;
    }

    if (enquiryForm.mobileNumber.replace(/[^0-9]/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmittingEnquiry(true);
    try {
      const res = await api.submitProductEnquiry({
        productId: product?._id,
        productName: product?.name,
        productSlug: product?.slug,
        customerName: enquiryForm.customerName.trim(),
        mobileNumber: enquiryForm.mobileNumber.trim(),
        email: enquiryForm.email.trim(),
        companyName: enquiryForm.companyName.trim(),
        requiredQuantity: enquiryForm.requiredQuantity.trim(),
        message: enquiryForm.message.trim(),
        enquiryType,
      });

      if (res.success) {
        toast.success(res.message || "Enquiry submitted successfully! Our packaging specialist will contact you shortly.");
        setEnquiryModalOpen(false);
        setEnquiryForm({
          customerName: "",
          mobileNumber: "",
          email: "",
          companyName: "",
          requiredQuantity: product?.minimumOrderQuantity || "",
          message: "",
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit enquiry. Please try again or call us.");
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const handlePincodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput || pincodeInput.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit PIN code");
      return;
    }

    setPincodeLoading(true);
    try {
      const res = await api.checkPincode(pincodeInput.trim());
      setPincodeResult(res);
      if (res.isServiceable) {
        toast.success(`Serviceable to ${res.city}! Express dispatch available.`);
      } else {
        toast.error("PIN code currently not serviceable.");
      }
    } catch {
      toast.error("Could not verify PIN code. Please try again.");
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const itemPayload: any = {
      productId: product._id,
      productName: product.name,
      slug: product.slug,
      image: activeImage || product.thumbnail || "/assets/corrugated-boxes.jpg",
      price: currentPackPrice,
      quantity: orderQuantity,
    };
    if (activeVariant?._id) itemPayload.variantId = activeVariant._id;
    if (hasVariants) {
      itemPayload.variantOptions = {
        topPaper: selectedTopPaper,
        packQuantity: selectedQuantity,
      };
    }
    if (comparePackPrice > 0) itemPayload.compareAtPrice = comparePackPrice;
    if (unitPricePerBox > 0) itemPayload.unitPricePerBox = unitPricePerBox;

    addItem(itemPayload);
    toast.success(`Added ${orderQuantity}x ${product.name} to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate({ to: "/checkout" });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewTitle || !reviewComment) {
      toast.error("Please provide review title and comments");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await api.addReview({
        productId: product._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      if (res.success) {
        toast.success("Thank you! Your review has been submitted.");
        setReviews([res.review, ...reviews]);
        setReviewTitle("");
        setReviewComment("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review. You must be logged in.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-2 animate-pulse">
          <div className="h-96 rounded-2xl bg-surface border border-border" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-surface" />
            <div className="h-4 w-1/2 rounded bg-surface" />
            <div className="h-24 rounded bg-surface" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-2 text-muted-foreground">This product may have been renamed or removed.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          Back to Catalogue
        </Link>
      </div>
    );
  }

  // Specifications array
  const specs: Array<{ label: string; value: string }> = Array.isArray(product.specifications)
    ? product.specifications.filter((s: any) => s && (s.label || s.value))
    : [];

  return (
    <div className="container-page py-8 md:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs font-semibold text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <li>
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/products" className="hover:text-primary transition-colors">
              Products
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          {product.category && (
            <>
              <li>
                <Link
                  to="/products"
                  search={{ category: product.category.slug || product.category.id }}
                  className="hover:text-primary transition-colors"
                >
                  {product.category.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
            </>
          )}
          <li className="font-bold text-foreground truncate max-w-xs">{product.name}</li>
        </ol>
      </nav>

      {/* Main Product Layout */}
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1.3fr] lg:gap-14 items-start">
        {/* ==================== LEFT: IMAGES GALLERY ==================== */}
        <div>
          {/* Main Large Image Container */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-card flex items-center justify-center min-h-[360px] sm:min-h-[440px]">
            {/* Wishlist Toggle */}
            <button
              type="button"
              onClick={() =>
                toggleWishlist({
                  _id: product._id,
                  name: product.name,
                  slug: product.slug,
                  thumbnail: activeImage || product.thumbnail,
                  minPrice: currentPackPrice,
                  maxPrice: currentPackPrice,
                  basePrice: currentPackPrice,
                })
              }
              className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full border border-border bg-card/90 shadow-xs backdrop-blur-xs transition-transform hover:scale-110"
              aria-label="Wishlist"
            >
              <Heart className={`size-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-foreground"}`} />
            </button>

            {/* Click to Zoom / Lightbox Trigger */}
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-lg border border-border bg-card/90 px-3 py-1.5 text-xs font-bold text-foreground shadow-xs backdrop-blur-xs transition-colors hover:bg-accent"
              title="Click to view high-resolution image"
            >
              <Maximize2 className="size-3.5 text-primary" />
              <span>Zoom Image</span>
            </button>

            <img
              src={activeImage || product.thumbnail || "/assets/corrugated-boxes.jpg"}
              alt={product.name}
              onClick={() => setLightboxOpen(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/assets/corrugated-boxes.jpg";
              }}
              className="max-h-[400px] w-full object-contain cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Thumbnails Row (Support up to 10 images) */}
          {product.images && product.images.length > 1 && (
            <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
              {product.images.slice(0, 10).map((img: any, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img.url)}
                  className={`size-18 shrink-0 overflow-hidden rounded-xl border p-1 bg-surface transition-all ${
                    activeImage === img.url
                      ? "border-primary ring-2 ring-primary/30 shadow-xs"
                      : "border-border hover:border-primary/50 opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`View thumbnail ${idx + 1}`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `${product.name} view ${idx + 1}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/corrugated-boxes.jpg";
                    }}
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Factory Trust Badges */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface/50 p-3 text-center">
              <ShieldCheck className="size-5 text-emerald-600" />
              <span className="mt-1 text-xs font-bold text-foreground">GST Invoiced</span>
              <span className="text-[10px] text-muted-foreground">18% ITC Eligible</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface/50 p-3 text-center">
              <Truck className="size-5 text-primary" />
              <span className="mt-1 text-xs font-bold text-foreground">Pan India Supply</span>
              <span className="text-[10px] text-muted-foreground">Express Transit</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface/50 p-3 text-center">
              <BadgeCheck className="size-5 text-amber-500" />
              <span className="mt-1 text-xs font-bold text-foreground">Factory Direct</span>
              <span className="text-[10px] text-muted-foreground">Krishna Traders (1991)</span>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT: PRODUCT DETAILS & ACTION BUTTONS ==================== */}
        <div>
          {/* Category & Subcategory Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {product.category && (
              <span className="inline-flex rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary uppercase tracking-wider">
                {product.category.name}
              </span>
            )}
            {product.subcategory && (
              <span className="inline-flex rounded-md bg-surface px-2.5 py-0.5 text-xs font-bold text-muted-foreground border border-border">
                {product.subcategory}
              </span>
            )}
          </div>

          <h1 className="mt-2.5 text-2xl font-black md:text-3xl text-foreground tracking-tight leading-snug">
            {product.name}
          </h1>

          {/* Ratings & Reviews */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${
                    i < Math.floor(product.rating || 5)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-foreground">
              {(product.rating || 5).toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount || 12} verified business reviews)
            </span>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* ==================== PRICING & MOQ BOX ==================== */}
          <div className="mt-5 rounded-2xl border border-border bg-surface/60 p-5 shadow-xs">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Approximate Price:
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-primary sm:text-3xl">
                    {product.approximatePrice
                      ? product.approximatePrice
                      : currentPackPrice > 0
                      ? `₹${currentPackPrice.toFixed(2)}`
                      : "Get Latest Price"}
                  </span>
                  {product.priceUnit && (
                    <span className="text-sm font-bold text-muted-foreground">
                      / {product.priceUnit}
                    </span>
                  )}
                </div>
              </div>

              {/* Minimum Order Quantity */}
              {product.minimumOrderQuantity && (
                <div className="rounded-xl border border-border bg-card px-3.5 py-2 text-right">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Minimum Order Quantity
                  </span>
                  <span className="text-sm font-extrabold text-foreground">
                    {product.minimumOrderQuantity}
                  </span>
                </div>
              )}
            </div>

            {/* Manufacturing / Delivery Information */}
            {product.manufacturingTime && (
              <div className="mt-3.5 pt-3 border-t border-border/60 flex items-center gap-2 text-xs font-semibold text-foreground">
                <Clock className="size-4 text-primary shrink-0" />
                <span>Manufacturing / Delivery: <strong>{product.manufacturingTime}</strong></span>
              </div>
            )}
          </div>

          {/* ==================== PART 6: 3 PROMINENT CTA BUTTONS ==================== */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* 1. Request Callback */}
            <button
              type="button"
              onClick={() => handleOpenEnquiry("REQUEST_CALLBACK")}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 px-4 text-xs sm:text-sm font-bold text-foreground shadow-xs transition-all hover:bg-accent hover:border-primary/50"
            >
              <PhoneCall className="size-4 text-primary" />
              <span>Request Callback</span>
            </button>

            {/* 2. Get Best Quote */}
            <button
              type="button"
              onClick={() => handleOpenEnquiry("GET_QUOTE")}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-xs sm:text-sm font-bold text-primary-foreground shadow-md transition-all hover:opacity-95 hover:shadow-lg"
            >
              <FileText className="size-4" />
              <span>Get Best Quote</span>
            </button>

            {/* 3. Yes! I am Interested */}
            <button
              type="button"
              onClick={() => handleOpenEnquiry("INTERESTED")}
              className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-neutral-800"
            >
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Yes! I am Interested</span>
            </button>
          </div>

          {/* ==================== E-COMMERCE VARIANT BUY SECTION (IF VARIANTS EXIST) ==================== */}
          {hasVariants && (
            <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-xs">
              <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" />
                Instant Online Order Calculator
              </h3>

              {/* Top Paper Selection */}
              {availablePapers.length > 0 && (
                <div className="mt-4">
                  <label className="text-xs font-bold text-foreground block mb-2">
                    Top Paper Finish: <span className="text-primary">{selectedTopPaper}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availablePapers.map((paper) => {
                      const active = selectedTopPaper.toLowerCase() === paper.toLowerCase();
                      return (
                        <button
                          key={paper}
                          type="button"
                          onClick={() => setSelectedTopPaper(paper)}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                            active
                              ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                              : "border-border bg-surface text-foreground hover:border-primary/50"
                          }`}
                        >
                          {active && <Check className="size-3.5" />}
                          {paper}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pack Quantity Selection */}
              {availableQuantities.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-foreground">
                      Pack Quantity: <span className="text-primary">{selectedQuantity} Pieces</span>
                    </label>
                    <span className="text-[11px] font-semibold text-emerald-600">Higher packs = Lower unit cost</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {availableQuantities.map((qty) => {
                      const active = Number(selectedQuantity) === Number(qty);
                      return (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setSelectedQuantity(qty)}
                          className={`rounded-lg border py-2 text-center text-xs font-bold transition-all ${
                            active
                              ? "border-primary bg-primary text-primary-foreground shadow-xs"
                              : "border-border bg-surface text-foreground hover:bg-accent"
                          }`}
                        >
                          {qty} Pcs
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Counter & Add to Cart */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3 items-stretch">
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-2">
                  <button
                    type="button"
                    onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-muted-foreground hover:text-foreground font-bold"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm">{orderQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setOrderQuantity((q) => q + 1)}
                    className="p-2 text-muted-foreground hover:text-foreground font-bold"
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs sm:text-sm font-bold text-primary-foreground shadow-xs transition-opacity hover:opacity-95"
                >
                  <ShoppingBag className="size-4" />
                  Add to Cart — ₹{totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors hover:bg-neutral-800"
                >
                  <Zap className="size-4 text-amber-400" />
                  Buy Now
                </button>
              </div>
            </div>
          )}

          {/* Pincode Serviceability Check */}
          <div className="mt-6 rounded-xl border border-border bg-surface/50 p-4">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              Check Delivery To Your Pincode
            </label>
            <form onSubmit={handlePincodeCheck} className="mt-2 flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Enter 6-digit Pincode (e.g. 110020)"
                className="h-10 flex-1 rounded-lg border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={pincodeLoading}
                className="rounded-lg bg-neutral-900 px-4 text-xs font-bold text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {pincodeLoading ? "Checking..." : "Check"}
              </button>
            </form>

            {pincodeResult && (
              <div className="mt-2.5 text-xs">
                {pincodeResult.isServiceable ? (
                  <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-700 font-medium">
                    ✓ {pincodeResult.message} (Estimated Arrival: <strong>{pincodeResult.estimatedDeliveryDate}</strong>)
                  </div>
                ) : (
                  <div className="rounded-md bg-red-500/10 p-2 text-red-600 font-medium">
                    ✕ {pincodeResult.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== PART 4: DYNAMIC PRODUCT SPECIFICATIONS TABLE ==================== */}
      {specs.length > 0 && (
        <section className="mt-14 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
          <div className="border-b border-border pb-4">
            <span className="text-xs font-extrabold tracking-wider text-primary uppercase">
              Technical Details
            </span>
            <h2 className="mt-1 text-xl font-bold md:text-2xl text-foreground">
              Product Specifications
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              All packaging specifications are customizable as per your production and branding requirements.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-xs sm:text-sm">
              <tbody className="divide-y divide-border">
                {specs.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors hover:bg-surface/60 ${
                      idx % 2 === 0 ? "bg-surface/30" : "bg-card"
                    }`}
                  >
                    <td className="w-1/2 py-3 px-4 font-semibold text-muted-foreground sm:px-6">
                      {item.label}
                    </td>
                    <td className="w-1/2 py-3 px-4 font-bold text-foreground sm:px-6">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ==================== PART 3C: PRODUCT DESCRIPTION SECTION ==================== */}
      <section className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
        <div className="border-b border-border pb-4">
          <span className="text-xs font-extrabold tracking-wider text-primary uppercase">
            Manufacturing Overview
          </span>
          <h2 className="mt-1 text-xl font-bold md:text-2xl text-foreground">
            Product Description
          </h2>
        </div>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground whitespace-pre-line">
          {product.description}
        </div>

        {product.additionalInformation && (
          <div className="mt-6 rounded-xl border border-border bg-surface/50 p-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Info className="size-4" />
              Additional Product Information
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.additionalInformation}
            </p>
          </div>
        )}
      </section>

      {/* ==================== REVIEWS SECTION ==================== */}
      <section className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold md:text-2xl text-foreground">Customer Reviews</h2>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold">{(product.rating || 5).toFixed(1)} out of 5</span>
              <span className="text-muted-foreground">({reviews.length} reviews)</span>
            </div>
          </div>
        </div>

        {/* Review Submission Form */}
        <form onSubmit={handleReviewSubmit} className="mt-6 rounded-xl border border-border bg-surface/50 p-5">
          <h3 className="text-sm font-bold">Write a Verified Review</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Your Rating</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="mt-1 h-10 w-full rounded-lg border border-border bg-card px-3 text-xs font-semibold"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                <option value={3}>⭐⭐⭐ (3 - Average)</option>
                <option value={2}>⭐⭐ (2 - Poor)</option>
                <option value={1}>⭐ (1 - Terrible)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Review Headline</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g. Robust quality and clear offset printing"
                className="mt-1 h-10 w-full rounded-lg border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-semibold text-muted-foreground">Detailed Comments</label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Tell other businesses about box quality, finish, and shipping turnaround..."
              className="mt-1 w-full rounded-lg border border-border bg-card p-3 text-xs font-medium outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingReview}
            className="mt-3 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 disabled:opacity-50"
          >
            {isSubmittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        {/* Reviews List */}
        <div className="mt-8 divide-y divide-border">
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <div key={rev._id} className="py-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{rev.userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-1 flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${
                        i < rev.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <h4 className="mt-1 text-sm font-bold">{rev.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="py-6 text-xs text-muted-foreground text-center">
              No reviews yet. Be the first to review this packaging product!
            </p>
          )}
        </div>
      </section>

      {/* ==================== RELATED PRODUCTS SECTION ==================== */}
      {relatedProducts.length > 0 && (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold tracking-wider text-primary uppercase">
                Explore More
              </span>
              <h2 className="mt-1 text-xl font-bold md:text-2xl text-foreground">
                Related Packaging Products
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <span>View all catalogue</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id || p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ==================== LIGHTBOX MODAL ==================== */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-card p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-surface text-foreground shadow-md transition-colors hover:bg-accent"
              aria-label="Close image lightbox"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center justify-center p-2">
              <img
                src={activeImage || product.thumbnail || "/assets/corrugated-boxes.jpg"}
                alt={product.name}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Thumbnail selector in lightbox */}
            {product.images && product.images.length > 1 && (
              <div className="no-scrollbar mt-3 flex justify-center gap-2 overflow-x-auto pb-1">
                {product.images.slice(0, 10).map((img: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img.url)}
                    className={`size-14 shrink-0 overflow-hidden rounded-lg border p-1 bg-surface transition-all ${
                      activeImage === img.url
                        ? "border-primary ring-2 ring-primary/40"
                        : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== ENQUIRY MODAL (PART 6) ==================== */}
      {enquiryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setEnquiryModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-primary">
                  <Sparkles className="size-3" />
                  {enquiryType === "REQUEST_CALLBACK"
                    ? "Request a Callback"
                    : enquiryType === "GET_QUOTE"
                    ? "Get Best Factory Quote"
                    : "Yes! I am Interested"}
                </span>
                <h3 className="mt-1 text-lg font-black text-foreground">
                  {product.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEnquiryModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEnquirySubmit} className="mt-4 space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-foreground">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.customerName}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, customerName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={enquiryForm.mobileNumber}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, mobileNumber: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-foreground">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                    placeholder="e.g. ramesh@company.com"
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">
                    Company Name <span className="text-muted-foreground text-[10px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={enquiryForm.companyName}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, companyName: e.target.value })}
                    placeholder="e.g. ABC Enterprises"
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">
                  Required Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={enquiryForm.requiredQuantity}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, requiredQuantity: e.target.value })}
                  placeholder={`e.g. ${product.minimumOrderQuantity || "4000 Piece"}`}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">
                  Specific Requirements or Dimensions
                </label>
                <textarea
                  rows={3}
                  value={enquiryForm.message}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                  placeholder="Tell us about size, lamination, board GSM, delivery city, or any custom specifications..."
                  className="mt-1 w-full rounded-xl border border-border bg-surface p-3 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEnquiryModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingEnquiry}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmittingEnquiry ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Submit Enquiry</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
