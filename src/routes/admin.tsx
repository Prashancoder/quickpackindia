import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  BookOpen,
  Tag,
  Star,
  Globe,
  Plus,
  Trash2,
  Edit,
  Eye,
  Check,
  Search,
  Lock,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Loader2,
  X,
  CheckCircle2,
  Layers,
  Sparkles,
  RefreshCw,
  Building,
  FileText,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  PhoneCall,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Management Console | QuickPack India" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

// Default Presets for quick selection
const PACKAGING_PRESET_IMAGES = [
  { name: "Corrugated Boxes", url: "/assets/corrugated-boxes.jpg" },
  { name: "Mailer Boxes", url: "/assets/mailer-boxes.jpg" },
  { name: "Mono Cartons", url: "/assets/mono-carton.jpg" },
  { name: "Paper Bags", url: "/assets/paper-bags.jpg" },
  { name: "Other Packaging", url: "/assets/other-products.jpg" },
  { name: "Factory / Warehouse", url: "/assets/factory.jpg" },
];

function AdminPage() {
  const { user, isAuthenticated, openLoginModal } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "products"
    | "enquiries"
    | "categories"
    | "orders"
    | "b2bOrders"
    | "quotations"
    | "b2bCustomers"
    | "customerLedger"
    | "blogs"
    | "coupons"
    | "seo"
  >("dashboard");

  // Admin Data
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [enquirySearch, setEnquirySearch] = useState<string>("");
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<string>("ALL");
  const [productSearch, setProductSearch] = useState<string>("");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("ALL");
  const [customImageUrlInput, setCustomImageUrlInput] = useState<string>("");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [b2bOrders, setB2BOrders] = useState<any[]>([]);
  const [b2bQuotations, setB2BQuotations] = useState<any[]>([]);
  const [b2bCustomers, setB2BCustomers] = useState<any[]>([]);
  const [customerLedger, setCustomerLedger] = useState<any[]>([]);
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState<string>("");

  // B2B Modals State
  const [statusModalOrder, setStatusModalOrder] = useState<any | null>(null);
  const [statusForm, setStatusForm] = useState({
    status: "",
    notes: "",
    estimatedCompletionDate: "",
  });

  const [paymentModalOrder, setPaymentModalOrder] = useState<any | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "BANK_TRANSFER",
    transactionReference: "",
    notes: "",
  });

  const [documentModalOrder, setDocumentModalOrder] = useState<any | null>(null);
  const [documentForm, setDocumentForm] = useState({
    title: "",
    documentType: "INVOICE",
    fileUrl: "",
    notes: "",
  });

  const [seoSettings, setSeoSettings] = useState<any>({
    websiteTitle: "QuickPack India | Corrugated Box & Packaging Manufacturer",
    websiteDescription: "Factory direct corrugated boxes, mailers, and cartons.",
    googleAnalyticsId: "G-5YB37D05GM",
    googleSearchConsoleVerification: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Product Create/Edit Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isUploadingProductImg, setIsUploadingProductImg] = useState(false);
  const [isUploadingGalleryImg, setIsUploadingGalleryImg] = useState(false);
  const [productImageTab, setProductImageTab] = useState<"upload" | "url" | "presets">("upload");

  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    sku: "",
    category: "",
    subcategory: "",
    description: "",
    shortDescription: "",
    approximatePrice: "",
    priceUnit: "Piece",
    minimumOrderQuantity: "4000 Piece",
    manufacturingTime: "8–10 Working Days",
    additionalInformation: "",
    basePrice: 0,
    compareAtPrice: 0,
    minPrice: 0,
    maxPrice: 0,
    stock: 5000,
    isActive: true,
    showOnHomepage: false,
    homepageOrder: 1,
    thumbnail: "/assets/corrugated-boxes.jpg",
    images: [] as Array<{ url: string; alt: string; isPrimary?: boolean }>,
    specifications: [] as Array<{ label: string; value: string }>,
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
  });

  // Blog Create/Edit State
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [isUploadingBlogImg, setIsUploadingBlogImg] = useState(false);
  const [blogImageTab, setBlogImageTab] = useState<"upload" | "url" | "presets">("upload");

  const [blogForm, setBlogForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "<p>Write your educational packaging content here...</p>",
    featuredImage: "/assets/corrugated-boxes.jpg",
    category: "",
    author: "QuickPack Editorial Team",
    status: "PUBLISHED",
    readingTime: 5,
  });

  const productFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const blogFileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  const fetchAdminData = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      if (activeTab === "dashboard") {
        const res = await api.admin.getDashboardStats();
        if (res.success) setStats(res.stats);
      } else if (activeTab === "products") {
        const [pRes, cRes] = await Promise.all([api.admin.getProducts(), api.admin.getCategories()]);
        if (pRes.success) setProducts(pRes.products);
        if (cRes.success) setCategories(cRes.categories);
      } else if (activeTab === "enquiries") {
        const res = await api.admin.getEnquiries({
          status: enquiryStatusFilter !== "ALL" ? enquiryStatusFilter : undefined,
          search: enquirySearch || undefined,
        });
        if (res.success) setEnquiries(res.enquiries);
      } else if (activeTab === "categories") {
        const res = await api.admin.getCategories();
        if (res.success) setCategories(res.categories);
      } else if (activeTab === "orders") {
        const res = await api.admin.getOrders();
        if (res.success) setOrders(res.orders);
      } else if (activeTab === "b2bOrders") {
        const res = await api.admin.getB2BOrders();
        if (res.success) setB2BOrders(res.orders);
      } else if (activeTab === "quotations") {
        const res = await api.admin.getQuotations();
        if (res.success) setB2BQuotations(res.quotations);
      } else if (activeTab === "b2bCustomers") {
        const res = await api.admin.getBusinessCustomers();
        if (res.success) setB2BCustomers(res.customers);
      } else if (activeTab === "customerLedger") {
        const [lRes, cRes] = await Promise.all([
          api.admin.getCustomerLedger({ customerId: selectedLedgerCustomer || undefined }),
          api.admin.getBusinessCustomers(),
        ]);
        if (lRes.success) setCustomerLedger(lRes.entries);
        if (cRes.success) setB2BCustomers(cRes.customers);
      } else if (activeTab === "blogs") {
        const [bRes, cRes] = await Promise.all([api.admin.getBlogs(), api.admin.getCategories()]);
        if (bRes.success) setBlogs(bRes.blogs);
        if (cRes.success) setCategories(cRes.categories);
      } else if (activeTab === "coupons") {
        const res = await api.admin.getCoupons();
        if (res.success) setCoupons(res.coupons);
      } else if (activeTab === "seo") {
        const res = await api.admin.getSeoSettings();
        if (res.success && res.settings) setSeoSettings(res.settings);
      }
    } catch (err: any) {
      console.warn("Failed to load admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab, isAdmin, selectedLedgerCustomer, enquiryStatusFilter]);

  if (!isAdmin) {
    return (
      <div className="container-page py-24 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-red-500/10 text-destructive">
          <Lock className="size-10" />
        </div>
        <h1 className="mt-5 text-2xl font-black md:text-3xl">Administrator Access Required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You must be logged in as an administrator (<span className="font-mono text-foreground font-semibold">admin@quickpack.in</span>) to view this console.
        </p>
        <button
          type="button"
          onClick={openLoginModal}
          className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md hover:opacity-95"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  // --- IMAGE UPLOAD HANDLERS ---
  const handleProductThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProductImg(true);
    try {
      const res = await api.uploadImage(file);
      if (res.success && res.url) {
        setProductForm((prev) => ({ ...prev, thumbnail: res.url }));
        toast.success("Product thumbnail uploaded successfully!");
      } else {
        toast.error(res.message || "Failed to upload image.");
      }
    } catch (err: any) {
      toast.error(err.message || "Image upload failed.");
    } finally {
      setIsUploadingProductImg(false);
    }
  };

  const handleProductGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingGalleryImg(true);
    try {
      const fileList = Array.from(files);
      const remainingSlots = 10 - (productForm.images?.length || 0);
      if (remainingSlots <= 0) {
        toast.error("Maximum 10 images allowed per product.");
        return;
      }
      const filesToUpload = fileList.slice(0, remainingSlots);

      const res = await api.uploadImages(filesToUpload);
      if (res.success && res.files) {
        const newImages = res.files.map((f, i) => ({
          url: f.url,
          alt: productForm.name || "Product Gallery Image",
          isPrimary: (productForm.images?.length || 0) === 0 && i === 0,
        }));
        setProductForm((prev) => {
          const combined = [...(prev.images || []), ...newImages].slice(0, 10);
          return {
            ...prev,
            images: combined,
            thumbnail: prev.thumbnail || combined[0]?.url || "",
          };
        });
        toast.success(`${newImages.length} gallery image(s) added!`);
      } else {
        toast.error(res.message || "Failed to upload gallery images.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gallery upload failed.");
    } finally {
      setIsUploadingGalleryImg(false);
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setProductForm((prev) => {
      const updated = prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }));
      const chosen = updated[index];
      return {
        ...prev,
        images: updated,
        thumbnail: chosen ? chosen.url : prev.thumbnail,
      };
    });
    toast.success("Set as primary product image!");
  };

  const handleMoveImage = (index: number, direction: "left" | "right") => {
    setProductForm((prev) => {
      const updated = [...prev.images];
      const targetIdx = direction === "left" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= updated.length) return prev;
      const currentItem = updated[index];
      const targetItem = updated[targetIdx];
      if (!currentItem || !targetItem) return prev;
      updated[index] = targetItem;
      updated[targetIdx] = currentItem;
      return { ...prev, images: updated };
    });
  };

  const handleDeleteImage = (index: number) => {
    setProductForm((prev) => {
      const targetImage = prev.images[index];
      const updated = prev.images.filter((_, i) => i !== index);
      const newThumb = updated.length > 0 ? (prev.thumbnail === targetImage?.url ? (updated[0]?.url || "") : prev.thumbnail) : "";
      return {
        ...prev,
        images: updated,
        thumbnail: newThumb,
      };
    });
  };

  const handleAddCustomImageUrl = () => {
    if (!customImageUrlInput.trim()) return;
    if (productForm.images.length >= 10) {
      toast.error("Maximum 10 images allowed per product.");
      return;
    }
    const url = customImageUrlInput.trim();
    setProductForm((prev) => {
      const isFirst = prev.images.length === 0;
      const newImages = [...prev.images, { url, alt: prev.name || "Product image", isPrimary: isFirst }];
      return {
        ...prev,
        images: newImages,
        thumbnail: prev.thumbnail || url,
      };
    });
    setCustomImageUrlInput("");
    toast.success("Image URL added to gallery!");
  };

  // --- DYNAMIC SPECIFICATIONS HANDLERS ---
  const handleAddSpecRow = () => {
    setProductForm((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { label: "", value: "" }],
    }));
  };

  const handleUpdateSpecRow = (index: number, field: "label" | "value", val: string) => {
    setProductForm((prev) => {
      const updated = [...prev.specifications];
      const row = updated[index];
      if (!row) return prev;
      updated[index] = { ...row, [field]: val };
      return { ...prev, specifications: updated };
    });
  };

  const handleDeleteSpecRow = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleMoveSpecRow = (index: number, direction: "up" | "down") => {
    setProductForm((prev) => {
      const updated = [...prev.specifications];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= updated.length) return prev;
      const currentItem = updated[index];
      const targetItem = updated[targetIdx];
      if (!currentItem || !targetItem) return prev;
      updated[index] = targetItem;
      updated[targetIdx] = currentItem;
      return { ...prev, specifications: updated };
    });
  };

  const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBlogImg(true);
    try {
      const res = await api.uploadImage(file);
      if (res.success && res.url) {
        setBlogForm((prev) => ({ ...prev, featuredImage: res.url }));
        toast.success("Blog cover image uploaded successfully!");
      } else {
        toast.error(res.message || "Failed to upload blog cover image.");
      }
    } catch (err: any) {
      toast.error(err.message || "Blog image upload failed.");
    } finally {
      setIsUploadingBlogImg(false);
    }
  };

  // --- PRODUCT ACTIONS ---
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: "",
      slug: "",
      sku: `QP-${Math.floor(1000 + Math.random() * 9000)}`,
      category: categories[0]?._id || "",
      subcategory: "Printed Duplex Box",
      description: "",
      shortDescription: "",
      approximatePrice: "",
      priceUnit: "Piece",
      minimumOrderQuantity: "4000 Piece",
      manufacturingTime: "8–10 Working Days",
      additionalInformation: "",
      basePrice: 0,
      compareAtPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      stock: 5000,
      isActive: true,
      showOnHomepage: false,
      homepageOrder: products.length + 1,
      thumbnail: "",
      images: [],
      specifications: [
        { label: "Material", value: "Cardboard" },
        { label: "Printing Type", value: "Offset Printing" },
        { label: "Lamination", value: "Gloss Lamination" },
      ],
      metaTitle: "",
      metaDescription: "",
      focusKeyword: "",
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: any) => {
    setEditingProductId(prod._id);
    const specs = Array.isArray(prod.specifications)
      ? prod.specifications.map((s: any) => ({ label: String(s?.label || ""), value: String(s?.value || "") }))
      : typeof prod.specifications === "object" && prod.specifications !== null
      ? Object.entries(prod.specifications).map(([label, value]) => ({ label, value: String(value || "") }))
      : [];

    const images =
      prod.images && Array.isArray(prod.images) && prod.images.length > 0
        ? prod.images
        : prod.thumbnail
        ? [{ url: prod.thumbnail, alt: prod.name, isPrimary: true }]
        : [];

    setProductForm({
      name: prod.name || "",
      slug: prod.slug || "",
      sku: prod.sku || "",
      category: typeof prod.category === "object" ? prod.category?._id : prod.category || categories[0]?._id || "",
      subcategory: prod.subcategory || "",
      description: prod.description || "",
      shortDescription: prod.shortDescription || "",
      approximatePrice: prod.approximatePrice || (prod.basePrice ? `₹${prod.basePrice}` : ""),
      priceUnit: prod.priceUnit || "Piece",
      minimumOrderQuantity: prod.minimumOrderQuantity || "",
      manufacturingTime: prod.manufacturingTime || "",
      additionalInformation: prod.additionalInformation || "",
      basePrice: prod.basePrice || 0,
      compareAtPrice: prod.compareAtPrice || 0,
      minPrice: prod.minPrice || 0,
      maxPrice: prod.maxPrice || 0,
      stock: prod.stock || 5000,
      isActive: prod.isActive !== false,
      showOnHomepage: Boolean(prod.showOnHomepage),
      homepageOrder: prod.homepageOrder || 0,
      thumbnail: prod.thumbnail || (images[0]?.url || ""),
      images,
      specifications: specs,
      metaTitle: prod.seo?.metaTitle || "",
      metaDescription: prod.seo?.metaDescription || "",
      focusKeyword: prod.seo?.focusKeyword || "",
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent, publishStatus?: boolean) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.description.trim()) {
      toast.error("Please enter product name and description.");
      return;
    }

    try {
      const generatedSlug =
        productForm.slug.trim() ||
        productForm.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const cleanSpecs = productForm.specifications
        .filter((s) => s.label.trim() || s.value.trim())
        .map((s) => ({ label: s.label.trim(), value: s.value.trim() }));

      const imagesPayload =
        productForm.images.length > 0
          ? productForm.images
          : productForm.thumbnail
          ? [{ url: productForm.thumbnail, alt: productForm.name, isPrimary: true }]
          : [];

      const effectiveIsActive = publishStatus !== undefined ? publishStatus : productForm.isActive;

      const payload = {
        ...productForm,
        isActive: effectiveIsActive,
        slug: generatedSlug,
        category: productForm.category || categories[0]?._id,
        images: imagesPayload,
        thumbnail: productForm.thumbnail || (imagesPayload[0]?.url || ""),
        specifications: cleanSpecs,
        seo: {
          metaTitle: productForm.metaTitle || `${productForm.name} | QuickPack India`,
          metaDescription:
            productForm.metaDescription || productForm.shortDescription || productForm.description.slice(0, 150),
          focusKeyword: productForm.focusKeyword || productForm.name,
        },
      };

      if (editingProductId) {
        await api.admin.updateProduct(editingProductId, payload);
        toast.success("Product updated successfully!");
      } else {
        await api.admin.createProduct(payload);
        toast.success("Product created successfully!");
      }

      setShowProductModal(false);
      setEditingProductId(null);
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product.");
    }
  };

  const handleToggleProductStatus = async (prod: any) => {
    try {
      const newStatus = !prod.isActive;
      await api.admin.updateProduct(prod._id, { isActive: newStatus });
      toast.success(`Product ${newStatus ? "published" : "moved to drafts"}.`);
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update product status.");
    }
  };

  const handleToggleHomepage = async (prod: any) => {
    try {
      const newHomepage = !prod.showOnHomepage;
      await api.admin.updateProduct(prod._id, { showOnHomepage: newHomepage });
      toast.success(`Product ${newHomepage ? "added to" : "removed from"} homepage.`);
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update homepage status.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    try {
      await api.admin.deleteProduct(id);
      toast.success("Product deleted successfully.");
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product.");
    }
  };

  // --- ENQUIRY ACTIONS ---
  const handleUpdateEnquiryStatus = async (id: string, status: string) => {
    try {
      await api.admin.updateEnquiryStatus(id, { status });
      toast.success(`Enquiry marked as ${status}.`);
      setEnquiries((prev) => prev.map((enq) => (enq._id === id ? { ...enq, status } : enq)));
    } catch (err: any) {
      toast.error(err.message || "Failed to update enquiry status.");
    }
  };

  const handleDeleteEnquiry = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      await api.admin.deleteEnquiry(id);
      toast.success("Enquiry deleted.");
      setEnquiries((prev) => prev.filter((e) => e._id !== id));
      if (selectedEnquiry?._id === id) setSelectedEnquiry(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete enquiry.");
    }
  };

  // --- BLOG ACTIONS ---
  const handleOpenAddBlog = () => {
    setEditingBlogId(null);
    setBlogForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "<p>Write your educational packaging content here...</p>",
      featuredImage: "/assets/corrugated-boxes.jpg",
      category: categories[0]?._id || "",
      author: "QuickPack Editorial Team",
      status: "PUBLISHED",
      readingTime: 5,
    });
    setShowBlogModal(true);
  };

  const handleOpenEditBlog = (blog: any) => {
    setEditingBlogId(blog._id);
    setBlogForm({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      featuredImage: blog.featuredImage || "/assets/corrugated-boxes.jpg",
      category: typeof blog.category === "object" ? blog.category?._id : blog.category || categories[0]?._id || "",
      author: blog.author || "QuickPack Editorial Team",
      status: blog.status || "PUBLISHED",
      readingTime: blog.readingTime || 5,
    });
    setShowBlogModal(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const generatedSlug =
        blogForm.slug.trim() ||
        blogForm.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const payload = {
        ...blogForm,
        slug: generatedSlug,
        category: blogForm.category || categories[0]?._id,
      };

      if (editingBlogId) {
        await api.admin.updateBlog(editingBlogId, payload);
        toast.success("Blog article updated successfully!");
      } else {
        await api.admin.createBlog(payload);
        toast.success("Blog article published with featured image!");
      }

      setShowBlogModal(false);
      setEditingBlogId(null);
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save blog.");
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog article?")) return;
    try {
      await api.admin.deleteBlog(id);
      toast.success("Blog article deleted.");
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete blog.");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.admin.updateOrderStatus(orderId, { orderStatus: status });
      toast.success(`Order status updated to ${status}`);
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order.");
    }
  };

  // --- B2B Operations Handlers ---
  const handleUpdateB2BStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalOrder) return;
    try {
      await api.admin.updateCustomOrderStatus(statusModalOrder._id, statusForm);
      toast.success("B2B Order status updated!");
      setStatusModalOrder(null);
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status.");
    }
  };

  const handleRecordB2BPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalOrder) return;
    try {
      await api.admin.recordOrderPayment(paymentModalOrder._id, {
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: paymentForm.transactionReference,
        notes: paymentForm.notes,
      });
      toast.success("Payment recorded and customer ledger updated!");
      setPaymentModalOrder(null);
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment.");
    }
  };

  const handleAttachB2BDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentModalOrder) return;
    try {
      await api.admin.attachOrderDocument(documentModalOrder._id, documentForm);
      toast.success("Document attached to custom order!");
      setDocumentModalOrder(null);
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to attach document.");
    }
  };

  const handleConvertQuotation = async (id: string) => {
    if (!window.confirm("Convert this quotation into a formal Custom Manufacturing Order?")) return;
    try {
      const res = await api.admin.convertQuotationToOrder(id);
      if (res.success) {
        toast.success(`Converted to Custom Order #${res.order?.orderNumber}!`);
        setActiveTab("b2bOrders");
        fetchAdminData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to convert quotation.");
    }
  };

  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            ADMIN CONSOLE
          </span>
          <h1 className="mt-2 text-2xl font-black md:text-3xl text-foreground">
            QuickPack Operations &amp; CMS
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchAdminData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold hover:bg-accent text-muted-foreground hover:text-foreground"
            title="Refresh Data"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold hover:bg-accent"
          >
            View Live Store →
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Admin Navigation */}
        <aside className="rounded-2xl border border-border bg-card p-3 shadow-card self-start">
          <nav className="space-y-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "dashboard"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <LayoutDashboard className="size-4" />
              Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "products"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="size-4" />
                <span>Our Products</span>
              </div>
              {products.length > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  activeTab === "products" ? "bg-white/20 text-white" : "bg-surface text-muted-foreground"
                }`}>
                  {products.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("enquiries")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "enquiries"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="size-4" />
                <span>Product Enquiries</span>
              </div>
              {enquiries.filter((e) => e.status === "NEW").length > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
                  {enquiries.filter((e) => e.status === "NEW").length} NEW
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "categories"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <FolderTree className="size-4" />
              Categories
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "orders"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <ShoppingBag className="size-4" />
              Customer Orders
            </button>

            {/* B2B Manufacturing Section */}
            <div className="pt-3 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground/70">
              B2B &amp; Manufacturing
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("b2bOrders")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "b2bOrders"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <Building className="size-4" />
              B2B Custom Orders
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("quotations")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "quotations"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <FileText className="size-4" />
              Quotations
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("b2bCustomers")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "b2bCustomers"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <Layers className="size-4" />
              Corporate Clients
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("customerLedger")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "customerLedger"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <Receipt className="size-4" />
              Customer Ledgers
            </button>

            {/* Content & Marketing Section */}
            <div className="pt-3 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground/70">
              Content &amp; Marketing
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("blogs")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "blogs"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <BookOpen className="size-4" />
              Blog CMS
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("coupons")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "coupons"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <Tag className="size-4" />
              Coupons
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "seo"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <Globe className="size-4" />
              Global SEO
            </button>
          </nav>
        </aside>

        {/* Content Panel */}
        <main className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card min-h-[500px]">
          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <h2 className="text-lg font-bold text-foreground">Performance Overview</h2>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Total Orders</span>
                  <p className="mt-2 text-3xl font-black text-foreground">{stats?.totalOrders || 0}</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Total Sales</span>
                  <p className="mt-2 text-3xl font-black text-primary">₹{(stats?.totalSales || 0).toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Active Products</span>
                  <p className="mt-2 text-3xl font-black text-foreground">{stats?.totalProducts || 0}</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Registered Users</span>
                  <p className="mt-2 text-3xl font-black text-foreground">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. OUR PRODUCTS DASHBOARD (PART 5) */}
          {activeTab === "products" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Our Products</h2>
                  <p className="text-xs text-muted-foreground">
                    Manage packaging products, image galleries, dynamic specifications, and homepage featured placement.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:opacity-95 shrink-0"
                >
                  <Plus className="size-4" />
                  Add New Product
                </button>
              </div>

              {/* Filters & Search */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by product name, SKU, or subcategory..."
                    className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-xs font-medium outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="size-3.5 text-muted-foreground" />
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="h-10 rounded-xl border border-border bg-surface px-3 text-xs font-semibold outline-none focus:border-primary"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((c) => (
                      <option key={c._id || c.slug} value={c._id || c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filtered Products List */}
              {(() => {
                const filtered = products.filter((p) => {
                  const matchSearch =
                    !productSearch.trim() ||
                    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.subcategory?.toLowerCase().includes(productSearch.toLowerCase());

                  const catId = typeof p.category === "object" ? p.category?._id : p.category;
                  const matchCat =
                    productCategoryFilter === "ALL" ||
                    catId === productCategoryFilter ||
                    p.category?.slug === productCategoryFilter;

                  return matchSearch && matchCat;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
                      <Package className="mx-auto size-12 text-muted-foreground/50" />
                      <p className="mt-3 text-sm font-bold text-foreground">No products found</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {productSearch || productCategoryFilter !== "ALL"
                          ? "Try clearing your search query or category filter."
                          : "Click 'Add New Product' to create your first dynamic packaging product."}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-border bg-surface/70 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="py-3 px-4">Product</th>
                            <th className="py-3 px-4">Category &amp; Variant</th>
                            <th className="py-3 px-4">Price / MOQ</th>
                            <th className="py-3 px-4">Homepage</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filtered.map((prod) => (
                            <tr key={prod._id} className="transition-colors hover:bg-surface/40">
                              {/* Product Info & Thumbnail */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-surface p-1">
                                    <img
                                      src={prod.thumbnail || prod.images?.[0]?.url || "/assets/corrugated-boxes.jpg"}
                                      alt={prod.name}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/assets/corrugated-boxes.jpg";
                                      }}
                                      className="size-full object-contain"
                                    />
                                    {prod.images && prod.images.length > 1 && (
                                      <span className="absolute bottom-0.5 right-0.5 rounded bg-black/75 px-1 text-[9px] font-bold text-white">
                                        {prod.images.length}
                                      </span>
                                    )}
                                  </div>
                                  <div className="min-w-0 max-w-xs">
                                    <h4 className="font-bold text-foreground truncate">{prod.name}</h4>
                                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
                                      /{prod.slug}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground">
                                      SKU: {prod.sku || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Category & Subcategory */}
                              <td className="py-3 px-4">
                                <span className="font-semibold text-foreground block">
                                  {prod.category?.name || "General"}
                                </span>
                                {prod.subcategory && (
                                  <span className="text-[11px] text-muted-foreground">
                                    {prod.subcategory}
                                  </span>
                                )}
                              </td>

                              {/* Price / MOQ */}
                              <td className="py-3 px-4">
                                <span className="font-extrabold text-primary block">
                                  {prod.approximatePrice
                                    ? `${prod.approximatePrice} / ${prod.priceUnit || "Piece"}`
                                    : prod.basePrice > 0
                                    ? `₹${prod.basePrice}`
                                    : "Quote"}
                                </span>
                                {prod.minimumOrderQuantity && (
                                  <span className="text-[10px] text-muted-foreground block">
                                    MOQ: {prod.minimumOrderQuantity}
                                  </span>
                                )}
                              </td>

                              {/* Homepage Feature Toggle */}
                              <td className="py-3 px-4">
                                <button
                                  type="button"
                                  onClick={() => handleToggleHomepage(prod)}
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${
                                    prod.showOnHomepage
                                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                                      : "bg-surface text-muted-foreground border border-border hover:bg-accent"
                                  }`}
                                  title="Click to toggle Homepage display"
                                >
                                  {prod.showOnHomepage ? (
                                    <>
                                      <Sparkles className="size-3" />
                                      <span>Homepage (Order: {prod.homepageOrder || 1})</span>
                                    </>
                                  ) : (
                                    <span>Not on Homepage</span>
                                  )}
                                </button>
                              </td>

                              {/* Status Toggle (Published / Draft) */}
                              <td className="py-3 px-4">
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductStatus(prod)}
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${
                                    prod.isActive !== false
                                      ? "bg-primary/10 text-primary border border-primary/20"
                                      : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                  }`}
                                  title="Click to toggle Published / Draft"
                                >
                                  {prod.isActive !== false ? "Published" : "Draft"}
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditProduct(prod)}
                                    className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-accent"
                                    title="Edit Product Details & Specifications"
                                  >
                                    <Edit className="size-3.5 inline mr-1" />
                                    Edit
                                  </button>
                                  <Link
                                    to="/products/$slug"
                                    params={{ slug: prod.slug }}
                                    target="_blank"
                                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                                    title="Preview Live Page in new tab"
                                  >
                                    <ExternalLink className="size-4" />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(prod._id)}
                                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-destructive"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ==================== PRODUCT ENQUIRIES ADMIN (PART 6) ==================== */}
          {activeTab === "enquiries" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Product Customer Enquiries</h2>
                  <p className="text-xs text-muted-foreground">
                    Inbound quote requests, callback requests, and interest leads from product detail pages.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Total: {enquiries.length} Enquir{enquiries.length === 1 ? "y" : "ies"}
                  </span>
                </div>
              </div>

              {/* Status Filter Tabs & Search */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
                  {["ALL", "NEW", "CONTACTED", "CONVERTED", "CLOSED"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setEnquiryStatusFilter(status)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                        enquiryStatusFilter === status
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border border-border bg-surface text-foreground hover:bg-accent"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={enquirySearch}
                    onChange={(e) => setEnquirySearch(e.target.value)}
                    placeholder="Search name, phone, product..."
                    className="h-9 w-full rounded-xl border border-border bg-surface pl-8 pr-3 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Enquiries Table */}
              {(() => {
                const filtered = enquiries.filter((enq) => {
                  const matchStatus = enquiryStatusFilter === "ALL" || enq.status === enquiryStatusFilter;
                  const matchSearch =
                    !enquirySearch.trim() ||
                    enq.customerName?.toLowerCase().includes(enquirySearch.toLowerCase()) ||
                    enq.mobileNumber?.includes(enquirySearch) ||
                    enq.email?.toLowerCase().includes(enquirySearch.toLowerCase()) ||
                    enq.productName?.toLowerCase().includes(enquirySearch.toLowerCase()) ||
                    enq.companyName?.toLowerCase().includes(enquirySearch.toLowerCase());
                  return matchStatus && matchSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
                      <PhoneCall className="mx-auto size-12 text-muted-foreground/50" />
                      <p className="mt-3 text-sm font-bold text-foreground">No enquiries found</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Customer callback requests and quotes will automatically appear here when submitted.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-border bg-surface/70 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Customer Details</th>
                            <th className="py-3 px-4">Product Enquired</th>
                            <th className="py-3 px-4">Required Qty</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filtered.map((enq) => (
                            <tr key={enq._id} className="transition-colors hover:bg-surface/40">
                              {/* Date */}
                              <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                                {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                                <span className="block text-[10px] text-muted-foreground/70">
                                  {new Date(enq.createdAt).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </td>

                              {/* Customer Contact */}
                              <td className="py-3 px-4">
                                <span className="font-bold text-foreground block">
                                  {enq.customerName}
                                </span>
                                {enq.companyName && (
                                  <span className="text-[11px] font-semibold text-primary block">
                                    {enq.companyName}
                                  </span>
                                )}
                                <div className="mt-0.5 flex flex-col text-[11px] text-muted-foreground">
                                  <a href={`tel:${enq.mobileNumber}`} className="hover:text-primary font-mono">
                                    📞 {enq.mobileNumber}
                                  </a>
                                  <a href={`mailto:${enq.email}`} className="hover:text-primary truncate max-w-xs">
                                    ✉️ {enq.email}
                                  </a>
                                </div>
                              </td>

                              {/* Product Name */}
                              <td className="py-3 px-4">
                                {enq.productSlug ? (
                                  <Link
                                    to="/products/$slug"
                                    params={{ slug: enq.productSlug }}
                                    target="_blank"
                                    className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                                  >
                                    <span>{enq.productName}</span>
                                    <ExternalLink className="size-3 text-muted-foreground" />
                                  </Link>
                                ) : (
                                  <span className="font-bold text-foreground">{enq.productName}</span>
                                )}
                              </td>

                              {/* Quantity */}
                              <td className="py-3 px-4 font-extrabold text-foreground">
                                {enq.requiredQuantity}
                              </td>

                              {/* Type Badge */}
                              <td className="py-3 px-4">
                                <span className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border">
                                  {enq.enquiryType === "REQUEST_CALLBACK"
                                    ? "Callback"
                                    : enq.enquiryType === "GET_QUOTE"
                                    ? "Best Quote"
                                    : "Interested"}
                                </span>
                              </td>

                              {/* Status Select */}
                              <td className="py-3 px-4">
                                <select
                                  value={enq.status || "NEW"}
                                  onChange={(e) => handleUpdateEnquiryStatus(enq._id, e.target.value)}
                                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold outline-none ${
                                    enq.status === "NEW"
                                      ? "border-amber-500/40 bg-amber-500/10 text-amber-600"
                                      : enq.status === "CONTACTED"
                                      ? "border-blue-500/40 bg-blue-500/10 text-blue-600"
                                      : enq.status === "CONVERTED"
                                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                                      : "border-border bg-surface text-muted-foreground"
                                  }`}
                                >
                                  <option value="NEW">NEW</option>
                                  <option value="CONTACTED">CONTACTED</option>
                                  <option value="CONVERTED">CONVERTED</option>
                                  <option value="CLOSED">CLOSED</option>
                                </select>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  {enq.message && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedEnquiry(enq)}
                                      className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-semibold hover:bg-accent"
                                      title="View Customer Message"
                                    >
                                      Message
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEnquiry(enq._id)}
                                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-destructive"
                                    title="Delete Enquiry"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 3. CATEGORIES MANAGEMENT */}
          {activeTab === "categories" && (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Packaging Categories</h2>
                  <p className="text-xs text-muted-foreground">Product categories and classification.</p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-border">
                {categories.map((cat) => (
                  <div key={cat._id || cat.slug} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={cat.image || "/assets/corrugated-boxes.jpg"}
                        alt={cat.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/corrugated-boxes.jpg";
                        }}
                        className="size-12 rounded-lg border border-border bg-surface object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-bold">{cat.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">/{cat.slug}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. ORDERS MANAGEMENT */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-lg font-bold text-foreground">Order Lifecycle Management</h2>
              <div className="mt-6 divide-y divide-border">
                {orders.map((ord) => (
                  <div key={ord._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm">#{ord.orderNumber}</span>
                        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                          {ord.paymentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Customer: {ord.shippingAddress?.fullName} ({ord.shippingAddress?.phone})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm">₹{ord.totalAmount?.toLocaleString("en-IN")}</span>
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                        className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4B. B2B CUSTOM MANUFACTURING ORDERS */}
          {activeTab === "b2bOrders" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">B2B Custom Manufacturing Orders</h2>
                  <p className="text-xs text-muted-foreground">
                    Track custom packaging batches, design approvals, advance payments, and production milestones.
                  </p>
                </div>
              </div>

              {b2bOrders.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
                  <Building className="mx-auto size-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm font-bold text-foreground">No B2B Custom Orders</p>
                  <p className="mt-1 text-xs text-muted-foreground">Custom manufacturing orders from corporate clients will appear here.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {b2bOrders.map((ord) => {
                    const company = ord.customer?.businessProfile?.companyName || ord.customer?.name || "Client";
                    return (
                      <div key={ord._id} className="rounded-2xl border border-border bg-surface p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-black text-sm text-foreground">#{ord.orderNumber}</span>
                              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                                {ord.boxType}
                              </span>
                              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                                {ord.productionStatus}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Client: <strong className="text-foreground">{company}</strong> ({ord.customer?.email}) • Qty:{" "}
                              <strong className="text-foreground">{ord.specifications?.quantity?.toLocaleString("en-IN")} pcs</strong>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-muted-foreground">Agreed Value</span>
                            <p className="text-base font-black text-foreground">₹{ord.pricing?.finalTotal?.toLocaleString("en-IN")}</p>
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              Advance: ₹{ord.pricing?.advancePaid || 0} / Bal: <strong className="text-destructive">₹{ord.pricing?.balanceDue || 0}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Specs row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="rounded-xl border border-border/60 bg-card p-2.5">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Dimensions</span>
                            <p className="font-bold text-foreground">
                              {ord.specifications?.dimensions?.length}×{ord.specifications?.dimensions?.width}×{ord.specifications?.dimensions?.height} {ord.specifications?.dimensions?.unit}
                            </p>
                          </div>
                          <div className="rounded-xl border border-border/60 bg-card p-2.5">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Board &amp; Ply</span>
                            <p className="font-bold text-foreground">
                              {ord.specifications?.ply} Ply • {ord.specifications?.gsm} GSM
                            </p>
                          </div>
                          <div className="rounded-xl border border-border/60 bg-card p-2.5">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Print &amp; Finish</span>
                            <p className="font-bold text-foreground">
                              {ord.specifications?.printing || "Plain"} • {ord.specifications?.finish || "Natural"}
                            </p>
                          </div>
                          <div className="rounded-xl border border-border/60 bg-card p-2.5">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Proof / Design</span>
                            <p className="font-bold text-foreground">
                              {ord.designFiles?.some((d: any) => d.customerApproved) ? "✅ Approved" : "⏳ Pending Approval"}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
                          <button
                            type="button"
                            onClick={() => {
                              setStatusModalOrder(ord);
                              setStatusForm({
                                status: ord.productionStatus || "IN_PRODUCTION",
                                notes: "",
                                estimatedCompletionDate: ord.estimatedCompletionDate ? ord.estimatedCompletionDate.split("T")[0] : "",
                              });
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold hover:bg-accent text-foreground"
                          >
                            <RefreshCw className="size-3.5 text-primary" />
                            Update Status
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPaymentModalOrder(ord);
                              setPaymentForm({
                                amount: String(ord.pricing?.balanceDue || ord.pricing?.advanceRequired || ""),
                                paymentMethod: "BANK_TRANSFER",
                                transactionReference: "",
                                notes: `Advance/Part-payment for Order #${ord.orderNumber}`,
                              });
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold hover:bg-accent text-foreground"
                          >
                            <CreditCard className="size-3.5 text-emerald-600" />
                            Record Payment
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDocumentModalOrder(ord);
                              setDocumentForm({
                                title: `Tax Invoice - #${ord.orderNumber}`,
                                documentType: "INVOICE",
                                fileUrl: "",
                                notes: "",
                              });
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold hover:bg-accent text-foreground"
                          >
                            <Upload className="size-3.5 text-primary" />
                            Attach Invoice / Doc
                          </button>

                          {ord.estimatedCompletionDate && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              Est. Completion: <strong className="text-foreground">{new Date(ord.estimatedCompletionDate).toLocaleDateString("en-IN")}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4C. B2B FORMAL QUOTATIONS */}
          {activeTab === "quotations" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">B2B Formal Quotations</h2>
                  <p className="text-xs text-muted-foreground">
                    Formal cost proposals with unit prices, GST (18%), and 1-click conversion to Custom Orders.
                  </p>
                </div>
              </div>

              {b2bQuotations.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
                  <FileText className="mx-auto size-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm font-bold text-foreground">No Quotations Issued</p>
                  <p className="mt-1 text-xs text-muted-foreground">Create engineering quotes or review customer RFQs.</p>
                </div>
              ) : (
                <div className="mt-6 divide-y divide-border">
                  {b2bQuotations.map((q) => {
                    const client = q.customer?.businessProfile?.companyName || q.customer?.name || "Corporate Client";
                    return (
                      <div key={q._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-black text-sm text-foreground">#{q.quoteNumber}</span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                q.status === "ACCEPTED" || q.status === "CONVERTED"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {q.status}
                            </span>
                            <span className="text-xs text-muted-foreground">• Valid until {new Date(q.validUntil).toLocaleDateString("en-IN")}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Client: <strong className="text-foreground">{client}</strong> • Product: <strong className="text-foreground">{q.boxType}</strong> (
                            {q.dimensions?.length}×{q.dimensions?.width}×{q.dimensions?.height} {q.dimensions?.unit})
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Quantity: <strong className="text-foreground">{q.quantity?.toLocaleString("en-IN")} pcs</strong> @ ₹{q.unitPrice?.toFixed(2)}/box • Advance Req: {q.advancePercent}%
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground">Total Incl. 18% GST</span>
                            <p className="text-base font-black text-foreground">₹{q.finalTotal?.toLocaleString("en-IN")}</p>
                          </div>
                          {q.status !== "CONVERTED" && (
                            <button
                              type="button"
                              onClick={() => handleConvertQuotation(q._id)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95"
                            >
                              <ArrowRight className="size-3.5" />
                              Convert to Order
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4D. CORPORATE CLIENTS DIRECTORY */}
          {activeTab === "b2bCustomers" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Corporate Business Clients</h2>
                  <p className="text-xs text-muted-foreground">
                    Directory of verified enterprise customers, company names, and GSTIN profiles.
                  </p>
                </div>
              </div>

              {b2bCustomers.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
                  <Layers className="mx-auto size-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm font-bold text-foreground">No Corporate Accounts Found</p>
                  <p className="mt-1 text-xs text-muted-foreground">Registered business clients will be listed here.</p>
                </div>
              ) : (
                <div className="mt-6 divide-y divide-border">
                  {b2bCustomers.map((c) => (
                    <div key={c._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-base shrink-0">
                          {(c.businessProfile?.companyName || c.name || "C").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground">
                              {c.businessProfile?.companyName || c.name}
                            </h4>
                            {c.businessProfile?.isVerified && (
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                                Verified GST
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Contact: {c.businessProfile?.contactPerson || c.name} • {c.email} • {c.phone || "No phone"}
                          </p>
                          {c.businessProfile?.gstin && (
                            <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                              GSTIN: <span className="font-semibold text-foreground">{c.businessProfile?.gstin}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLedgerCustomer(c._id);
                            setActiveTab("customerLedger");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-bold hover:bg-accent text-foreground"
                        >
                          <Receipt className="size-3.5 text-primary" />
                          View Ledger
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4E. FINANCIAL ACCOUNT LEDGER */}
          {activeTab === "customerLedger" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Customer Financial Ledger Statements</h2>
                  <p className="text-xs text-muted-foreground">
                    Complete chronological statement of invoices, recorded advances, payments, and running balances.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Filter Client:</span>
                  <select
                    value={selectedLedgerCustomer}
                    onChange={(e) => setSelectedLedgerCustomer(e.target.value)}
                    className="h-9 rounded-xl border border-border bg-surface px-3 text-xs font-bold outline-none"
                  >
                    <option value="">All Corporate Clients</option>
                    {b2bCustomers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.businessProfile?.companyName || c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {customerLedger.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
                  <Receipt className="mx-auto size-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm font-bold text-foreground">No Ledger Entries Recorded</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ledger entries are created automatically when orders are confirmed and payments are recorded.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Client</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Description / Reference</th>
                        <th className="p-3 text-right">Debit (+)</th>
                        <th className="p-3 text-right">Credit (-)</th>
                        <th className="p-3 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-medium">
                      {customerLedger.map((entry) => (
                        <tr key={entry._id} className="hover:bg-accent/40">
                          <td className="p-3 text-muted-foreground whitespace-nowrap">
                            {new Date(entry.transactionDate).toLocaleDateString("en-IN")}
                          </td>
                          <td className="p-3 font-bold text-foreground">
                            {entry.customer?.businessProfile?.companyName || entry.customer?.name || "Client"}
                          </td>
                          <td className="p-3">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                entry.entryType === "PAYMENT"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-blue-500/10 text-blue-600"
                              }`}
                            >
                              {entry.entryType}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-foreground">{entry.description}</p>
                            <span className="font-mono text-[10px] text-muted-foreground">Ref: {entry.referenceNumber}</span>
                          </td>
                          <td className="p-3 text-right font-bold text-foreground">
                            {entry.debit > 0 ? `₹${entry.debit?.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-600">
                            {entry.credit > 0 ? `₹${entry.credit?.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="p-3 text-right font-black text-foreground">
                            ₹{entry.runningBalance?.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 5. BLOG CMS */}
          {activeTab === "blogs" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Packaging Blog &amp; Knowledge Base</h2>
                  <p className="text-xs text-muted-foreground">Publish educational guides, technical articles &amp; cover photos.</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddBlog}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:opacity-95"
                >
                  <Plus className="size-4" />
                  Write New Article
                </button>
              </div>

              {blogs.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
                  <BookOpen className="mx-auto size-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm font-bold text-foreground">No blog articles found</p>
                  <p className="mt-1 text-xs text-muted-foreground">Click "Write New Article" to publish your first educational post.</p>
                </div>
              ) : (
                <div className="mt-6 divide-y divide-border">
                  {blogs.map((b) => (
                    <div key={b._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={b.featuredImage || "/assets/corrugated-boxes.jpg"}
                          alt={b.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/corrugated-boxes.jpg";
                          }}
                          className="size-16 rounded-xl border border-border bg-surface object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground">{b.title}</h4>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                b.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-600" : "bg-yellow-500/10 text-yellow-600"
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Author: {b.author || "QuickPack"} • {b.readingTime || 5} min read
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditBlog(b)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent"
                          title="Edit Article"
                        >
                          <Edit className="size-3.5" />
                          Edit
                        </button>
                        <Link
                          to="/blog/$slug"
                          params={{ slug: b.slug }}
                          target="_blank"
                          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                          title="View Live Article"
                        >
                          <Eye className="size-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlog(b._id)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-destructive"
                          title="Delete Article"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. GLOBAL SEO SETTINGS */}
          {activeTab === "seo" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-bold text-foreground">Global SEO &amp; Google Structured Data</h2>
                <p className="text-xs text-muted-foreground">Configure search engine titles, verification tokens, and Google Analytics.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Website Meta Title</label>
                  <input
                    type="text"
                    value={seoSettings.websiteTitle}
                    onChange={(e) => setSeoSettings({ ...seoSettings, websiteTitle: e.target.value })}
                    className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Meta Description</label>
                  <textarea
                    rows={3}
                    value={seoSettings.websiteDescription}
                    onChange={(e) => setSeoSettings({ ...seoSettings, websiteDescription: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-surface p-3 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Google Analytics 4 Measurement ID</label>
                  <input
                    type="text"
                    value={seoSettings.googleAnalyticsId}
                    onChange={(e) => setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })}
                    placeholder="G-XXXXXXXXXX"
                    className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await api.admin.updateSeoSettings(seoSettings);
                    toast.success("SEO Settings Saved!");
                  }}
                  className="rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:opacity-90"
                >
                  Save SEO Configuration
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* PART 5: COMPREHENSIVE PRODUCT CREATE & EDIT MODAL                         */}
      {/* ========================================================================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setShowProductModal(false)} />
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-foreground">
                  {editingProductId ? `Edit Product: ${productForm.name || "Untitled"}` : "Add New Packaging Product"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure product details, upload up to 10 photos, customize dynamic specifications &amp; homepage placement.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleSaveProduct(e)} className="mt-6 space-y-7 text-xs">
              {/* ==================== 1. BASIC INFORMATION ==================== */}
              <div className="rounded-2xl border border-border bg-surface/50 p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Package className="size-4" />
                  1. Basic Information
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="font-bold text-foreground block mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setProductForm((prev) => ({
                          ...prev,
                          name,
                          slug: editingProductId ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                        }));
                      }}
                      placeholder="e.g. Printed LED Packaging Box"
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">
                      Product URL Slug <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-[11px]">
                        /products/
                      </span>
                      <input
                        type="text"
                        required
                        value={productForm.slug}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                          })
                        }
                        placeholder="printed-led-packaging-box"
                        className="h-10 w-full rounded-xl border border-border bg-card pl-20 pr-3 text-xs font-mono font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="font-bold text-foreground block mb-1">
                      Product Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id || c.slug} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">
                      Subcategory / Product Variant
                    </label>
                    <input
                      type="text"
                      value={productForm.subcategory}
                      onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                      placeholder="e.g. Printed Duplex Box"
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">
                    Short Description (Summary)
                  </label>
                  <input
                    type="text"
                    value={productForm.shortDescription}
                    onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                    placeholder="e.g. High-definition printed duplex packaging boxes for LED bulbs, tube lights, and electronics."
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">
                    Full Product Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Enter comprehensive product overview, capabilities, paper material grades, and customization options..."
                    className="w-full rounded-xl border border-border bg-card p-3 text-xs font-medium outline-none focus:border-primary leading-relaxed"
                  />
                </div>

                {/* Homepage & Status Controls */}
                <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                    <div>
                      <span className="font-bold text-foreground block">Product Status</span>
                      <span className="text-[11px] text-muted-foreground">
                        {productForm.isActive ? "Published (Visible)" : "Draft (Hidden)"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, isActive: !productForm.isActive })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        productForm.isActive ? "bg-primary" : "bg-neutral-300 dark:bg-neutral-700"
                      }`}
                    >
                      <span
                        className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                          productForm.isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                    <div>
                      <span className="font-bold text-foreground block">Show on Homepage</span>
                      <span className="text-[11px] text-muted-foreground">
                        {productForm.showOnHomepage ? "Featured in 8-grid" : "Not displayed"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, showOnHomepage: !productForm.showOnHomepage })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        productForm.showOnHomepage ? "bg-emerald-600" : "bg-neutral-300 dark:bg-neutral-700"
                      }`}
                    >
                      <span
                        className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                          productForm.showOnHomepage ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">
                      Homepage Display Order
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={productForm.homepageOrder}
                      onChange={(e) => setProductForm({ ...productForm, homepageOrder: Number(e.target.value) })}
                      placeholder="1, 2, 3..."
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* ==================== 2. PRODUCT IMAGES (UP TO 10) ==================== */}
              <div className="rounded-2xl border border-border bg-surface/50 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <ImageIcon className="size-4" />
                      2. Product Images ({productForm.images?.length || 0}/10 Images)
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Support up to 10 images. Click the star on any image to make it the featured / primary cover photo.
                    </p>
                  </div>

                  {/* Switch between upload file, custom URL, and preset */}
                  <div className="flex rounded-lg border border-border bg-card p-0.5 text-[11px] font-semibold self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setProductImageTab("upload")}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        productImageTab === "upload" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductImageTab("url")}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        productImageTab === "url" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Enter URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductImageTab("presets")}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        productImageTab === "presets" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Presets
                    </button>
                  </div>
                </div>

                {/* Upload Input Area */}
                {productImageTab === "upload" && (
                  <div>
                    <input
                      ref={galleryFileInputRef}
                      type="file"
                      multiple
                      accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                      className="hidden"
                      onChange={handleProductGalleryUpload}
                    />
                    <button
                      type="button"
                      disabled={isUploadingGalleryImg || (productForm.images?.length || 0) >= 10}
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card p-5 text-center transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingGalleryImg ? (
                        <div className="flex items-center gap-2 font-bold text-primary">
                          <Loader2 className="size-4 animate-spin" />
                          Uploading product images...
                        </div>
                      ) : (
                        <>
                          <Upload className="size-6 text-muted-foreground mb-1" />
                          <span className="font-bold text-foreground">Click to Browse and Upload Multiple Images</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            JPG, PNG, WEBP up to 10MB each ({10 - (productForm.images?.length || 0)} slots available)
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {productImageTab === "url" && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customImageUrlInput}
                      onChange={(e) => setCustomImageUrlInput(e.target.value)}
                      placeholder="Paste image URL (e.g. https://5.imimg.com/... or /assets/...)"
                      className="h-10 flex-1 rounded-xl border border-border bg-card px-3 text-xs outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomImageUrl}
                      className="rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground hover:opacity-95"
                    >
                      Add Image
                    </button>
                  </div>
                )}

                {productImageTab === "presets" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PACKAGING_PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          if ((productForm.images?.length || 0) >= 10) {
                            toast.error("Maximum 10 images reached.");
                            return;
                          }
                          setProductForm((prev) => ({
                            ...prev,
                            images: [...prev.images, { url: preset.url, alt: preset.name, isPrimary: prev.images.length === 0 }],
                            thumbnail: prev.thumbnail || preset.url,
                          }));
                          toast.success(`Added ${preset.name}!`);
                        }}
                        className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 text-left hover:border-primary transition-all"
                      >
                        <img src={preset.url} alt={preset.name} className="size-8 rounded object-cover" />
                        <span className="truncate text-xs font-semibold">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Uploaded Images Preview & Reordering Grid */}
                {productForm.images && productForm.images.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      Current Gallery (Reorder, Star Primary, or Delete):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {productForm.images.map((img, idx) => {
                        const isPrimary = img.isPrimary || productForm.thumbnail === img.url || idx === 0;
                        return (
                          <div
                            key={idx}
                            className={`group relative rounded-xl border p-2 bg-card flex flex-col justify-between transition-all ${
                              isPrimary ? "border-amber-400 ring-2 ring-amber-400/30" : "border-border"
                            }`}
                          >
                            <div className="relative aspect-square overflow-hidden rounded-lg bg-surface flex items-center justify-center">
                              <img
                                src={img.url}
                                alt={`Product view ${idx + 1}`}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/assets/corrugated-boxes.jpg";
                                }}
                                className="h-full w-full object-contain"
                              />
                              {isPrimary && (
                                <span className="absolute top-1 left-1 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs">
                                  ★ Featured
                                </span>
                              )}
                            </div>

                            {/* Action controls */}
                            <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-1.5 text-[11px]">
                              {/* Set Primary Button */}
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className={`p-1 rounded hover:bg-accent ${isPrimary ? "text-amber-500 font-bold" : "text-muted-foreground hover:text-amber-500"}`}
                                title="Set as primary featured image"
                              >
                                <Star className={`size-3.5 ${isPrimary ? "fill-amber-400" : ""}`} />
                              </button>

                              {/* Reorder Left */}
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveImage(idx, "left")}
                                className="p-1 rounded text-muted-foreground hover:bg-accent disabled:opacity-30"
                                title="Move Left"
                              >
                                ←
                              </button>

                              {/* Reorder Right */}
                              <button
                                type="button"
                                disabled={idx === productForm.images.length - 1}
                                onClick={() => handleMoveImage(idx, "right")}
                                className="p-1 rounded text-muted-foreground hover:bg-accent disabled:opacity-30"
                                title="Move Right"
                              >
                                →
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(idx)}
                                className="p-1 rounded text-muted-foreground hover:bg-red-500/10 hover:text-destructive"
                                title="Remove photo"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ==================== 3. PRICING & MOQ INFORMATION ==================== */}
              <div className="rounded-2xl border border-border bg-surface/50 p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <CreditCard className="size-4" />
                  3. Pricing Information &amp; MOQ
                </h4>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="font-bold text-foreground block mb-1">
                      Approximate Price
                    </label>
                    <input
                      type="text"
                      value={productForm.approximatePrice}
                      onChange={(e) => setProductForm({ ...productForm, approximatePrice: e.target.value })}
                      placeholder="e.g. ₹1.25 or 1.25"
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">
                      Price Unit
                    </label>
                    <select
                      value={productForm.priceUnit}
                      onChange={(e) => setProductForm({ ...productForm, priceUnit: e.target.value })}
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary"
                    >
                      <option value="Piece">Piece</option>
                      <option value="Box">Box</option>
                      <option value="Kg">Kg</option>
                      <option value="Pack">Pack</option>
                      <option value="Set">Set</option>
                      <option value="Roll">Roll</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">
                      Minimum Order Quantity (MOQ)
                    </label>
                    <input
                      type="text"
                      value={productForm.minimumOrderQuantity}
                      onChange={(e) => setProductForm({ ...productForm, minimumOrderQuantity: e.target.value })}
                      placeholder="e.g. 4000 Piece"
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border/60">
                  <div>
                    <label className="font-semibold text-muted-foreground block mb-1">
                      Base Online Price (Optional, for checkout) (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={productForm.basePrice}
                      onChange={(e) => setProductForm({ ...productForm, basePrice: Number(e.target.value) })}
                      placeholder="0"
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground block mb-1">
                      Inventory Stock Available
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      placeholder="5000"
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* ==================== 4. DYNAMIC SPECIFICATION EDITOR (PART 4 & PART 5) ==================== */}
              <div className="rounded-2xl border border-border bg-surface/50 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Layers className="size-4" />
                      4. Product Specifications ({productForm.specifications?.length || 0} rows)
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Add unlimited dynamic label-value specification rows. Use controls to reorder or delete.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="inline-flex items-center gap-1 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-95"
                  >
                    <Plus className="size-3.5" />
                    Add Specification
                  </button>
                </div>

                {productForm.specifications && productForm.specifications.length > 0 ? (
                  <div className="space-y-2.5">
                    {productForm.specifications.map((row, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-border bg-card p-2.5 shadow-2xs"
                      >
                        <span className="w-6 text-center font-mono font-bold text-muted-foreground text-xs">
                          {idx + 1}.
                        </span>

                        {/* Label input */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={row.label}
                            onChange={(e) => handleUpdateSpecRow(idx, "label", e.target.value)}
                            placeholder="Specification Name (e.g. Board Thickness, Material, GSM)"
                            className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold outline-none focus:border-primary"
                          />
                        </div>

                        {/* Value input */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={row.value}
                            onChange={(e) => handleUpdateSpecRow(idx, "value", e.target.value)}
                            placeholder="Value (e.g. 350 GSM, Cardboard, Gloss Lamination)"
                            className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs font-medium outline-none focus:border-primary"
                          />
                        </div>

                        {/* Reorder and Delete controls */}
                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSpecRow(idx, "up")}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === productForm.specifications.length - 1}
                            onClick={() => handleMoveSpecRow(idx, "down")}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSpecRow(idx)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-destructive"
                            title="Delete Row"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center">
                    <p className="text-xs text-muted-foreground">No specifications added yet.</p>
                    <button
                      type="button"
                      onClick={handleAddSpecRow}
                      className="mt-2 text-xs font-bold text-primary hover:underline"
                    >
                      + Add first specification row
                    </button>
                  </div>
                )}
              </div>

              {/* ==================== 5. ADDITIONAL INFORMATION & SEO ==================== */}
              <div className="rounded-2xl border border-border bg-surface/50 p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Globe className="size-4" />
                  5. Manufacturing Time &amp; SEO Metadata
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="font-bold text-foreground block mb-1">
                      Manufacturing / Delivery Time
                    </label>
                    <input
                      type="text"
                      value={productForm.manufacturingTime}
                      onChange={(e) => setProductForm({ ...productForm, manufacturingTime: e.target.value })}
                      placeholder="e.g. 8–10 Working Days"
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">
                      SEO Focus Keyword
                    </label>
                    <input
                      type="text"
                      value={productForm.focusKeyword}
                      onChange={(e) => setProductForm({ ...productForm, focusKeyword: e.target.value })}
                      placeholder="e.g. Printed LED Packaging Box"
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">
                    Additional Product Information (Custom Options, UV, Embossing)
                  </label>
                  <textarea
                    rows={2}
                    value={productForm.additionalInformation}
                    onChange={(e) => setProductForm({ ...productForm, additionalInformation: e.target.value })}
                    placeholder="Custom sizes, hanging punch hole options, embossing, UV coating and customized brand logo printing available on bulk factory orders..."
                    className="w-full rounded-xl border border-border bg-card p-3 text-xs font-medium outline-none focus:border-primary"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="font-bold text-foreground block mb-1">SEO Meta Title</label>
                    <input
                      type="text"
                      value={productForm.metaTitle}
                      onChange={(e) => setProductForm({ ...productForm, metaTitle: e.target.value })}
                      placeholder={`${productForm.name || "Product"} | QuickPack India`}
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">SEO Meta Description</label>
                    <input
                      type="text"
                      value={productForm.metaDescription}
                      onChange={(e) => setProductForm({ ...productForm, metaDescription: e.target.value })}
                      placeholder={productForm.shortDescription || "Meta description for Google search snippet..."}
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons: Save as Draft, Publish Product, Cancel */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="rounded-xl border border-border px-5 py-2.5 font-bold hover:bg-accent"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSaveProduct(e, false)}
                  className="rounded-xl border border-border bg-card px-5 py-2.5 font-bold text-foreground hover:bg-accent"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSaveProduct(e, true)}
                  className="rounded-xl bg-primary px-7 py-2.5 font-bold text-primary-foreground shadow-md transition-all hover:opacity-95 hover:shadow-lg"
                >
                  {editingProductId ? "Update & Publish Product" : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ENQUIRY DETAILS MODAL (PART 6)                                            */}
      {/* ========================================================================= */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedEnquiry(null)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                  {selectedEnquiry.enquiryType}
                </span>
                <h3 className="mt-1 text-lg font-black text-foreground">
                  Enquiry for {selectedEnquiry.productName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-3">
                <div>
                  <span className="text-muted-foreground font-semibold block">Customer Name:</span>
                  <span className="font-bold text-foreground text-sm">{selectedEnquiry.customerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold block">Company:</span>
                  <span className="font-bold text-foreground">{selectedEnquiry.companyName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold block">Mobile:</span>
                  <a href={`tel:${selectedEnquiry.mobileNumber}`} className="font-bold text-primary">
                    {selectedEnquiry.mobileNumber}
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold block">Email:</span>
                  <a href={`mailto:${selectedEnquiry.email}`} className="font-bold text-primary truncate block">
                    {selectedEnquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold block">Required Quantity:</span>
                  <span className="font-extrabold text-foreground text-sm">{selectedEnquiry.requiredQuantity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold block">Date:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(selectedEnquiry.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {selectedEnquiry.message && (
                <div>
                  <label className="font-bold text-foreground block mb-1">Customer Message:</label>
                  <p className="rounded-xl border border-border bg-surface p-3 leading-relaxed whitespace-pre-line text-foreground">
                    {selectedEnquiry.message}
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Status:</span>
                  <select
                    value={selectedEnquiry.status}
                    onChange={(e) => {
                      handleUpdateEnquiryStatus(selectedEnquiry._id, e.target.value);
                      setSelectedEnquiry({ ...selectedEnquiry, status: e.target.value });
                    }}
                    className="h-8 rounded-lg border border-border bg-surface px-2 font-bold text-xs"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="CONVERTED">CONVERTED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BLOG CREATION & EDIT MODAL WITH FEATURED IMAGE UPLOAD SYSTEM             */}
      {/* ========================================================================= */}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowBlogModal(false)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {editingBlogId ? "Edit Packaging Article" : "Write Educational Packaging Article"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Upload article cover image and publish clean semantic HTML guides.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBlogModal(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="mt-6 space-y-6 text-xs">
              {/* --- 1. BLOG FEATURED IMAGE UPLOAD --- */}
              <div className="rounded-2xl border border-border bg-surface/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <ImageIcon className="size-4 text-primary" />
                    Featured Article Cover Image *
                  </label>
                  <div className="flex rounded-lg border border-border bg-card p-0.5 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setBlogImageTab("upload")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        blogImageTab === "upload" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlogImageTab("presets")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        blogImageTab === "presets" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlogImageTab("url")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        blogImageTab === "url" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Custom URL
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Current Featured Image Preview */}
                  <div className="relative h-24 w-40 shrink-0 rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                    <img
                      src={blogForm.featuredImage || "/assets/corrugated-boxes.jpg"}
                      alt="Cover Preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/corrugated-boxes.jpg";
                      }}
                      className="size-full object-cover"
                    />
                    {isUploadingBlogImg && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                        <Loader2 className="size-5 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Mode 1: File Upload */}
                  {blogImageTab === "upload" && (
                    <div className="flex-1 w-full">
                      <input
                        ref={blogFileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                        className="hidden"
                        onChange={handleBlogImageUpload}
                      />
                      <button
                        type="button"
                        disabled={isUploadingBlogImg}
                        onClick={() => blogFileInputRef.current?.click()}
                        className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card p-4 text-center transition-colors cursor-pointer"
                      >
                        {isUploadingBlogImg ? (
                          <div className="flex items-center gap-2 font-bold text-primary">
                            <Loader2 className="size-4 animate-spin" />
                            Uploading cover image...
                          </div>
                        ) : (
                          <>
                            <Upload className="size-5 text-muted-foreground mb-1" />
                            <span className="font-bold text-foreground">Upload Article Cover Banner</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">Supports PNG, JPG, WEBP up to 10MB</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Mode 2: Presets */}
                  {blogImageTab === "presets" && (
                    <div className="flex-1 w-full grid grid-cols-3 gap-2">
                      {PACKAGING_PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setBlogForm({ ...blogForm, featuredImage: preset.url })}
                          className={`flex items-center gap-2 rounded-lg border p-1.5 text-left transition-all ${
                            blogForm.featuredImage === preset.url
                              ? "border-primary bg-primary/10 text-primary font-bold"
                              : "border-border bg-card text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="size-6 rounded object-cover" />
                          <span className="truncate text-[10px]">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Mode 3: Custom URL */}
                  {blogImageTab === "url" && (
                    <div className="flex-1 w-full space-y-1">
                      <input
                        type="text"
                        value={blogForm.featuredImage}
                        onChange={(e) => setBlogForm({ ...blogForm, featuredImage: e.target.value })}
                        placeholder="https://example.com/blog-cover.jpg or /assets/..."
                        className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs outline-none focus:border-primary"
                      />
                      <p className="text-[10px] text-muted-foreground">Direct image URL for the article header.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* --- 2. ARTICLE DETAILS --- */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-semibold text-muted-foreground">Article Headline *</label>
                  <input
                    type="text"
                    required
                    value={blogForm.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setBlogForm({
                        ...blogForm,
                        title,
                        slug: blogForm.slug ? blogForm.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      });
                    }}
                    placeholder="e.g. 5 Mistakes to Avoid When Sourcing Corrugated Boxes"
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-surface px-3"
                  />
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground">Category *</label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-surface px-3 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="font-semibold text-muted-foreground">Author</label>
                  <input
                    type="text"
                    value={blogForm.author}
                    onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-surface px-3"
                  />
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground">Status</label>
                  <select
                    value={blogForm.status}
                    onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-surface px-3 font-medium"
                  >
                    <option value="PUBLISHED">PUBLISHED (Live)</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground">Reading Time (Mins)</label>
                  <input
                    type="number"
                    min={1}
                    value={blogForm.readingTime}
                    onChange={(e) => setBlogForm({ ...blogForm, readingTime: Number(e.target.value) })}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-surface px-3"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Excerpt / Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  placeholder="Short summary displayed on cards and search results..."
                  className="mt-1 w-full rounded-xl border border-border bg-surface p-3"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Article Content (Semantic HTML) *</label>
                <textarea
                  rows={8}
                  required
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-surface p-3 font-mono text-[11px]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowBlogModal(false)}
                  className="rounded-xl border border-border px-5 py-2.5 font-bold hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-6 py-2.5 font-bold text-primary-foreground shadow-md hover:opacity-95"
                >
                  {editingBlogId ? "Update Article" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* B2B STATUS UPDATE MODAL                                                   */}
      {/* ========================================================================= */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setStatusModalOrder(null)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">
                Update Order #{statusModalOrder.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setStatusModalOrder(null)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateB2BStatus} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground">Production / Milestone Status *</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 font-bold text-xs"
                >
                  <option value="ENQUIRY_RECEIVED">Enquiry Received</option>
                  <option value="QUOTATION_PREPARED">Quotation Prepared</option>
                  <option value="AWAITING_CUSTOMER_APPROVAL">Awaiting Customer Approval</option>
                  <option value="AWAITING_ADVANCE">Awaiting Advance</option>
                  <option value="AWAITING_DESIGN">Awaiting Design / Artwork</option>
                  <option value="DESIGN_UNDER_REVIEW">Design Under Review</option>
                  <option value="AWAITING_CUSTOMER_DESIGN_APPROVAL">Awaiting Customer Design Approval</option>
                  <option value="APPROVED_FOR_PRODUCTION">Approved for Production</option>
                  <option value="IN_PRODUCTION">In Production</option>
                  <option value="QUALITY_CHECK">Quality Check</option>
                  <option value="READY_FOR_DISPATCH">Ready for Dispatch</option>
                  <option value="DISPATCHED">Dispatched</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Estimated Completion Date</label>
                <input
                  type="date"
                  value={statusForm.estimatedCompletionDate}
                  onChange={(e) => setStatusForm({ ...statusForm, estimatedCompletionDate: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 font-medium text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Internal / Customer Notes</label>
                <textarea
                  rows={3}
                  value={statusForm.notes}
                  onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                  placeholder="e.g. Die cutting completed, moving to 2-color flexographic printing stage..."
                  className="mt-1 w-full rounded-xl border border-border bg-surface p-3 text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setStatusModalOrder(null)}
                  className="rounded-xl border border-border px-4 py-2 font-bold hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground shadow-sm hover:opacity-95"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* B2B RECORD PAYMENT MODAL                                                  */}
      {/* ========================================================================= */}
      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setPaymentModalOrder(null)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground">
                  Record Payment for Order #{paymentModalOrder.orderNumber}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Total: ₹{paymentModalOrder.pricing?.finalTotal?.toLocaleString("en-IN")} • Balance: ₹{paymentModalOrder.pricing?.balanceDue?.toLocaleString("en-IN")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalOrder(null)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleRecordB2BPayment} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground">Payment Method *</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 font-bold text-xs"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer / NEFT / RTGS</option>
                    <option value="UPI">UPI</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash</option>
                    <option value="RAZORPAY">Razorpay</option>
                    <option value="CASHFREE">Cashfree</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Transaction / UTR Reference *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-HDFC902847194 or Cheque #004921"
                  value={paymentForm.transactionReference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 font-medium text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-surface p-3 text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setPaymentModalOrder(null)}
                  className="rounded-xl border border-border px-4 py-2 font-bold hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-sm hover:opacity-95"
                >
                  Record &amp; Reconcile Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* B2B ATTACH DOCUMENT MODAL                                                 */}
      {/* ========================================================================= */}
      {documentModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDocumentModalOrder(null)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">
                Attach Document to Order #{documentModalOrder.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setDocumentModalOrder(null)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAttachB2BDocument} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground">Document Title *</label>
                <input
                  type="text"
                  required
                  value={documentForm.title}
                  onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 font-semibold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground">Document Type *</label>
                  <select
                    value={documentForm.documentType}
                    onChange={(e) => setDocumentForm({ ...documentForm, documentType: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 font-bold text-xs"
                  >
                    <option value="INVOICE">Tax Invoice</option>
                    <option value="RECEIPT">Payment Receipt</option>
                    <option value="DELIVERY_CHALLAN">Delivery Challan</option>
                    <option value="TEST_REPORT">Lab Test Report (GSM/Burst)</option>
                    <option value="SPEC_SHEET">Specification Sheet</option>
                    <option value="OTHER">Other Document</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground">File URL / Storage Link *</label>
                  <input
                    type="text"
                    required
                    placeholder="https://... or /uploads/..."
                    value={documentForm.fileUrl}
                    onChange={(e) => setDocumentForm({ ...documentForm, fileUrl: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={documentForm.notes}
                  onChange={(e) => setDocumentForm({ ...documentForm, notes: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-surface p-3 text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setDocumentModalOrder(null)}
                  className="rounded-xl border border-border px-4 py-2 font-bold hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground shadow-sm hover:opacity-95"
                >
                  Attach Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
