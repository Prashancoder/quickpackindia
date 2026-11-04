import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { ProductVariant } from "../models/ProductVariant";
import { Blog } from "../models/Blog";
import { Coupon } from "../models/Coupon";
import { Pincode } from "../models/Pincode";
import { Quotation } from "../models/Quotation";
import { CustomOrder } from "../models/CustomOrder";
import { CustomerLedger } from "../models/CustomerLedger";
import { SeoSettings } from "../models/SeoSettings";

export async function seedLedPackagingBox(): Promise<void> {
  try {
    const existing = await Product.findOne({ slug: "printed-led-packaging-box" });
    if (existing) {
      console.log("[Seed] 'Printed LED Packaging Box' already exists.");
      return;
    }

    let category = await Category.findOne({ slug: "mono-cartons" });
    if (!category) {
      category = await Category.findOne();
    }
    if (!category) {
      category = await Category.create({
        name: "Mono Cartons",
        slug: "mono-cartons",
        description: "High-definition printed duplex folding cartons for cosmetics, pharmaceuticals, and retail goods.",
        image: "/assets/mono-carton.jpg",
        order: 1,
      });
    }

    const initialImages = [
      {
        url: "https://5.imimg.com/data5/IG/KT/YT/SELLER-1700741/duplex-boxes-500x500.jpg",
        alt: "Printed LED Packaging Box Main Image",
        isPrimary: true,
      },
      {
        url: "https://5.imimg.com/data5/ANDROID/Default/2020/9/QY/UJ/LO/1700741/product-jpeg-125x125.jpg",
        alt: "Printed LED Packaging Box Variant View 1",
      },
      {
        url: "https://5.imimg.com/data5/SELLER/Default/2022/9/FQ/WU/JJ/1700741/duplex-boxes-125x125.jpg",
        alt: "Printed LED Packaging Box Variant View 2",
      },
      {
        url: "https://5.imimg.com/data5/IG/KT/YT/SELLER-1700741/duplex-boxes-125x125.jpg",
        alt: "Printed LED Packaging Box Variant View 3",
      },
      {
        url: "https://5.imimg.com/data5/YM/KW/JB/SELLER-1700741/duplex-boxes-125x125.png",
        alt: "Printed LED Packaging Box Variant View 4",
      },
      {
        url: "https://5.imimg.com/data5/HS/BV/UI/SELLER-1700741/duplex-boxes-125x125.jpg",
        alt: "Printed LED Packaging Box Variant View 5",
      },
      {
        url: "https://5.imimg.com/data5/ANDROID/Default/2020/9/HR/PA/WR/1700741/product-jpeg-125x125.jpg",
        alt: "Printed LED Packaging Box Variant View 6",
      },
      {
        url: "https://5.imimg.com/data5/SELLER/Default/2022/9/SB/TI/NZ/1700741/duplex-boxes-125x125.jpg",
        alt: "Printed LED Packaging Box Variant View 7",
      },
      {
        url: "https://5.imimg.com/data5/SELLER/PDFImage/2026/3/590096895/WG/PA/BU/1700741/printed-duplex-box-125x125.png",
        alt: "Printed LED Packaging Box Technical Specification Sheet",
      },
    ];

    const initialSpecs = [
      { label: "Board Thickness (GSM)", value: "350 GSM" },
      { label: "Box Capacity", value: "Upto 250g" },
      { label: "Material", value: "Cardboard" },
      { label: "Board Grade", value: "FBB / SBS" },
      { label: "Printing Type", value: "Offset Printing" },
      { label: "Lamination", value: "Gloss Lamination" },
      { label: "Color", value: "Multi-Colour" },
      { label: "Property", value: "Light Weight" },
      { label: "Pattern", value: "Printed" },
      { label: "Shape", value: "Rectangle" },
      { label: "Usage/Application", value: "Electronics" },
    ];

    await Product.create({
      name: "Printed LED Packaging Box",
      slug: "printed-led-packaging-box",
      sku: "QP-LED-DUPLEX",
      category: category._id,
      subcategory: "Printed Duplex Box",
      shortDescription:
        "High-definition printed duplex packaging boxes for LED bulbs, tube lights, and electronics.",
      description:
        "Our product range includes a wide range of printed duplex boxes, printed LED panel light packaging boxes, printed LED bulb packaging boxes, LED bulb boxes with hanging options and 4 feet printed LED tube light packaging boxes.\n\nWe manufacture LED bulb boxes within 8–10 working days, including designing services, customized sizes and high-quality paper materials.",
      images: initialImages,
      thumbnail: initialImages[0].url,
      approximatePrice: "₹1.25",
      priceUnit: "Piece",
      minimumOrderQuantity: "4000 Piece",
      manufacturingTime: "8–10 Working Days",
      additionalInformation:
        "Custom sizes, hanging punch hole options, embossing, UV coating and customized brand logo printing available on bulk factory orders.",
      basePrice: 1.25,
      minPrice: 1.25,
      maxPrice: 1.25,
      stock: 50000,
      isActive: true,
      isFeatured: true,
      showOnHomepage: true,
      homepageOrder: 1,
      tags: ["printed-led-box", "duplex-box", "mono-carton", "electronics", "offset-printing"],
      specifications: initialSpecs,
      seo: {
        metaTitle: "Printed LED Packaging Box Manufacturer | Duplex Bulb Boxes | QuickPack India",
        metaDescription:
          "Leading manufacturer of printed LED packaging boxes, bulb cartons, and duplex boxes in India. 350 GSM cardboard, gloss lamination, factory direct price ₹1.25/Piece.",
        focusKeyword: "Printed LED Packaging Box",
        canonicalUrl: "/products/printed-led-packaging-box",
      },
    });

    console.log("[Seed] Successfully created 'Printed LED Packaging Box'!");
  } catch (err: any) {
    console.error("[Seed Error] Failed to seed 'Printed LED Packaging Box':", err.message);
  }
}

export async function runSeedIfEmpty(): Promise<void> {
  try {
    await seedB2BIfEmpty();
    await seedLedPackagingBox();

    const productCount = await Product.countDocuments();
    if (productCount > 1) {
      console.log(`[Seed] Database contains ${productCount} products.`);
      return;
    }

    console.log("[Seed] Populating initial sample data...");

    // 1. Seed Categories
    const categoriesData = [
      {
        name: "Corrugated Boxes",
        slug: "corrugated-boxes",
        description:
          "Heavy duty 3-ply, 5-ply, and 7-ply corrugated shipping boxes designed for maximum transit protection.",
        image: "/assets/corrugated-boxes.png",
        seoTitle: "Corrugated Boxes Manufacturer & Wholesale Supplier | QuickPack India",
        seoDescription:
          "Buy heavy-duty corrugated shipping boxes at factory direct prices. 3-ply, 5-ply, 7-ply custom sizes available Pan India.",
        focusKeyword: "corrugated boxes",
        order: 1,
      },
      {
        name: "Mailer Boxes",
        slug: "mailer-boxes",
        description:
          "Self-locking kraft and white corrugated mailer boxes for premium e-commerce unboxing experiences.",
        image: "/assets/mailer-boxes.jpg",
        seoTitle: "Custom Mailer Boxes for E-commerce Packaging | QuickPack India",
        seoDescription:
          "Order premium die-cut mailer boxes with custom logo printing. Factory direct bulk supply across India.",
        focusKeyword: "mailer boxes",
        order: 2,
      },
      {
        name: "Mono Cartons",
        slug: "mono-cartons",
        description:
          "High-definition printed duplex folding cartons for cosmetics, pharmaceuticals, and retail goods.",
        image: "/assets/mono-carton.jpg",
        seoTitle: "Mono Carton Packaging & Duplex Boxes | QuickPack India",
        seoDescription:
          "Custom printed mono carton boxes for cosmetics, FMCG, and electronics. High quality finish.",
        focusKeyword: "mono cartons",
        order: 3,
      },
      {
        name: "Paper Bags",
        slug: "paper-bags",
        description: "Eco-friendly kraft and retail paper carry bags with twisted and flat handles.",
        image: "/assets/paper-bags.jpg",
        seoTitle: "Kraft Paper Bags & Custom Shopping Bags | QuickPack India",
        seoDescription:
          "Recyclable kraft paper carry bags in bulk. Custom branding available for retail and events.",
        focusKeyword: "paper bags",
        order: 4,
      },
      {
        name: "Packaging Materials",
        slug: "packaging-materials",
        description:
          "Adhesive tapes, shredded paper filler, thank you cards, and protective packaging accessories.",
        image: "/assets/other-products.jpg",
        seoTitle: "Packaging Accessories, Tapes & Shredded Paper | QuickPack India",
        seoDescription: "Complete unboxing supplies including custom tape, shredded paper, and cards.",
        focusKeyword: "packaging materials",
        order: 5,
      },
    ];

    const createdCategories: any = {};
    for (const cat of categoriesData) {
      const doc = await Category.create(cat);
      createdCategories[cat.slug] = doc._id;
    }

    // 2. Seed Users & Admin
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash("Admin@123", salt);
    const userPasswordHash = await bcrypt.hash("User@123", salt);

    await User.create([
      {
        name: "QuickPack Admin",
        email: "admin@quickpack.in",
        phone: "+91 9871002637",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        addresses: [
          {
            fullName: "Admin QuickPack",
            phone: "+91 9871002637",
            houseFlat: "Plot 42",
            street: "Okhla Industrial Area Phase 3",
            area: "South Delhi",
            city: "New Delhi",
            state: "Delhi",
            pincode: "110020",
            landmark: "Near Metro Station",
            isDefault: true,
          },
        ],
      },
      {
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "+91 98765 43210",
        passwordHash: userPasswordHash,
        role: "USER",
        addresses: [
          {
            fullName: "Rahul Sharma",
            phone: "+91 98765 43210",
            houseFlat: "Flat 402, Tower B",
            street: "Cyber City Boulevard",
            area: "DLF Phase 2",
            city: "Gurugram",
            state: "Haryana",
            pincode: "122002",
            landmark: "Opposite Cyber Hub",
            isDefault: true,
          },
        ],
      },
      {
        name: "Priya Patel",
        email: "priya.patel@example.com",
        phone: "+91 98220 12345",
        passwordHash: userPasswordHash,
        role: "USER",
        addresses: [
          {
            fullName: "Priya Patel",
            phone: "+91 98220 12345",
            houseFlat: "B-12, Green Park Society",
            street: "Andheri Kurla Road",
            area: "Andheri East",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400069",
            landmark: "Near Metro",
            isDefault: true,
          },
        ],
      },
    ]);

    // 3. Seed Products with Multi-Attribute Variants
    const product1 = await Product.create({
      name: "4 X 4 X 1.5 Inch Corrugated Box",
      slug: "4-x-4-x-1-5-inch-corrugated-box",
      sku: "QP-4415",
      shortDescription:
        "Compact 3-ply corrugated box perfect for jewelry, electronics, accessories, and e-commerce shipping.",
      description:
        "Our 4 X 4 X 1.5 inch corrugated boxes are manufactured with premium kraft fluting for robust stacking strength and superior edge crush resistance. Available in classic Brown, pristine White, or custom Logo Printed finishes across multiple pack sizes with factory-direct pricing.",
      category: createdCategories["corrugated-boxes"],
      subcategory: "3 Ply Boxes",
      thumbnail: "/assets/corrugated-boxes.jpg",
      images: [
        { url: "/assets/corrugated-boxes.jpg", alt: "4 X 4 X 1.5 Inch Corrugated Box", isPrimary: true },
        { url: "/assets/mailer-boxes.jpg", alt: "4 X 4 X 1.5 Inch Corrugated Box Open View" },
      ],
      basePrice: 892.1,
      compareAtPrice: 1023.0,
      minPrice: 790.0,
      maxPrice: 33500.0,
      rating: 4.8,
      reviewCount: 24,
      stock: 50000,
      isActive: true,
      isFeatured: true,
      tags: ["3-ply", "corrugated", "best-seller", "small-box"],
      specifications: {
        "Dimensions (L x W x H)": "4 X 4 X 1.5 Inch",
        Material: "Virgin Kraft Paper",
        "Ply / Flute": "3 Ply (B-Flute)",
        GSM: "180 / 140 / 180 GSM",
        Finish: "Natural Brown / Bleached White / Custom Printed",
        "Bursting Strength": "12 - 14 kg/cm²",
        Recyclability: "100% Biodegradable & Recyclable",
      },
      seo: {
        metaTitle: "4 X 4 X 1.5 Inch Corrugated Box | Pack of 100 to 5000 | QuickPack India",
        metaDescription:
          "Buy 4 X 4 X 1.5 inch corrugated boxes in bulk. Choose White, Brown or Logo Printed packaging with factory-direct pricing and fast Pan India delivery.",
        focusKeyword: "4 X 4 X 1.5 Inch Corrugated Box",
        canonicalUrl: "/products/4-x-4-x-1-5-inch-corrugated-box",
        ogTitle: "4 X 4 X 1.5 Inch Corrugated Box | Factory Direct",
        ogDescription: "High strength small corrugated box for shipping and retail packaging.",
      },
    });

    // Variants for Product 1 (Top Paper × Quantity)
    const p1Variants = [
      // White
      { topPaper: "White", packQuantity: 100, price: 892.1, compareAtPrice: 1023.0, unitPrice: 8.92, sku: "QP-4415-WHT-100" },
      { topPaper: "White", packQuantity: 200, price: 1690.0, compareAtPrice: 1950.0, unitPrice: 8.45, sku: "QP-4415-WHT-200" },
      { topPaper: "White", packQuantity: 500, price: 3950.0, compareAtPrice: 4600.0, unitPrice: 7.9, sku: "QP-4415-WHT-500" },
      { topPaper: "White", packQuantity: 1000, price: 7400.0, compareAtPrice: 8800.0, unitPrice: 7.4, sku: "QP-4415-WHT-1000" },
      { topPaper: "White", packQuantity: 3000, price: 21000.0, compareAtPrice: 25000.0, unitPrice: 7.0, sku: "QP-4415-WHT-3000" },
      { topPaper: "White", packQuantity: 5000, price: 33500.0, compareAtPrice: 40000.0, unitPrice: 6.7, sku: "QP-4415-WHT-5000" },

      // Brown
      { topPaper: "Brown", packQuantity: 100, price: 790.0, compareAtPrice: 920.0, unitPrice: 7.9, sku: "QP-4415-BRN-100" },
      { topPaper: "Brown", packQuantity: 200, price: 1490.0, compareAtPrice: 1750.0, unitPrice: 7.45, sku: "QP-4415-BRN-200" },
      { topPaper: "Brown", packQuantity: 500, price: 3490.0, compareAtPrice: 4100.0, unitPrice: 6.98, sku: "QP-4415-BRN-500" },
      { topPaper: "Brown", packQuantity: 1000, price: 6500.0, compareAtPrice: 7800.0, unitPrice: 6.5, sku: "QP-4415-BRN-1000" },
      { topPaper: "Brown", packQuantity: 3000, price: 18500.0, compareAtPrice: 22000.0, unitPrice: 6.16, sku: "QP-4415-BRN-3000" },
      { topPaper: "Brown", packQuantity: 5000, price: 29500.0, compareAtPrice: 35000.0, unitPrice: 5.9, sku: "QP-4415-BRN-5000" },

      // Logo Printed
      { topPaper: "Logo Printed", packQuantity: 500, price: 4800.0, compareAtPrice: 5600.0, unitPrice: 9.6, sku: "QP-4415-PRT-500" },
      { topPaper: "Logo Printed", packQuantity: 1000, price: 8900.0, compareAtPrice: 10500.0, unitPrice: 8.9, sku: "QP-4415-PRT-1000" },
    ];

    await ProductVariant.insertMany(
      p1Variants.map((v) => ({
        productId: product1._id,
        sku: v.sku,
        options: { topPaper: v.topPaper, packQuantity: v.packQuantity, size: "4 X 4 X 1.5 Inch" },
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        unitPricePerBox: v.unitPrice,
        stock: 5000,
        isActive: true,
      }))
    );

    // Product 2: 3 Ply Corrugated Box
    const product2 = await Product.create({
      name: "3 Ply Corrugated Box",
      slug: "3-ply-corrugated-box",
      sku: "QP-3PLY",
      shortDescription:
        "Light-duty 3-ply corrugated box suited to e-commerce shipping of lightweight goods, documents and apparel.",
      description:
        "Light-duty 3 ply corrugated box engineered for e-commerce dispatch, warehousing, and parcel logistics. Manufactured using high quality semi-kraft and virgin kraft liners for optimal crush resistance and clean appearance.",
      category: createdCategories["corrugated-boxes"],
      thumbnail: "/assets/corrugated-boxes.jpg",
      images: [{ url: "/assets/corrugated-boxes.jpg", alt: "3 Ply Corrugated Box", isPrimary: true }],
      basePrice: 590.0,
      compareAtPrice: 690.0,
      minPrice: 590.0,
      maxPrice: 24500.0,
      rating: 4.9,
      reviewCount: 38,
      stock: 40000,
      isActive: true,
      isFeatured: true,
      tags: ["3-ply", "corrugated", "shipping"],
      specifications: {
        "Ply / Flute": "3 Ply (B/C Flute)",
        Material: "Kraft Liner Board",
        "Edge Crush Test (ECT)": "32 ECT",
        Usage: "E-commerce, Clothing, Books, Small Electronics",
      },
      seo: {
        metaTitle: "3 Ply Corrugated Box Manufacturer & Supplier | QuickPack India",
        metaDescription: "Buy 3 ply corrugated boxes wholesale in Delhi NCR and Pan India.",
        focusKeyword: "3 Ply Corrugated Box",
        canonicalUrl: "/products/3-ply-corrugated-box",
      },
    });

    await ProductVariant.insertMany([
      { productId: product2._id, sku: "QP-3PLY-BRN-100", options: { topPaper: "Brown", packQuantity: 100 }, price: 590, compareAtPrice: 690, unitPricePerBox: 5.9, stock: 5000, isActive: true },
      { productId: product2._id, sku: "QP-3PLY-BRN-500", options: { topPaper: "Brown", packQuantity: 500 }, price: 2750, compareAtPrice: 3200, unitPricePerBox: 5.5, stock: 5000, isActive: true },
      { productId: product2._id, sku: "QP-3PLY-BRN-1000", options: { topPaper: "Brown", packQuantity: 1000 }, price: 5100, compareAtPrice: 6000, unitPricePerBox: 5.1, stock: 5000, isActive: true },
      { productId: product2._id, sku: "QP-3PLY-WHT-100", options: { topPaper: "White", packQuantity: 100 }, price: 680, compareAtPrice: 800, unitPricePerBox: 6.8, stock: 5000, isActive: true },
      { productId: product2._id, sku: "QP-3PLY-WHT-500", options: { topPaper: "White", packQuantity: 500 }, price: 3150, compareAtPrice: 3700, unitPricePerBox: 6.3, stock: 5000, isActive: true },
      { productId: product2._id, sku: "QP-3PLY-WHT-1000", options: { topPaper: "White", packQuantity: 1000 }, price: 5900, compareAtPrice: 7000, unitPricePerBox: 5.9, stock: 5000, isActive: true },
    ]);

    // Product 3: 5 Ply Corrugated Box
    const product3 = await Product.create({
      name: "5 Ply Corrugated Box",
      slug: "5-ply-corrugated-box",
      sku: "QP-5PLY",
      shortDescription:
        "Heavy-duty 5 ply corrugated box with dual fluting layers for medium to heavy weight cargo protection.",
      description:
        "Double-wall 5 ply corrugated box engineered with double fluting (AB flute) for high stacking capacity and puncture resistance. Ideal for industrial shipments, FMCG multipacks, glassware, and export packaging.",
      category: createdCategories["corrugated-boxes"],
      thumbnail: "/assets/corrugated-boxes.jpg",
      images: [{ url: "/assets/corrugated-boxes.jpg", alt: "5 Ply Corrugated Box", isPrimary: true }],
      basePrice: 1250.0,
      compareAtPrice: 1450.0,
      minPrice: 1250.0,
      maxPrice: 48000.0,
      rating: 4.9,
      reviewCount: 42,
      stock: 35000,
      isActive: true,
      isFeatured: true,
      tags: ["5-ply", "heavy-duty", "industrial"],
      specifications: {
        "Ply / Flute": "5 Ply (AB Double Wall)",
        Material: "Heavy Kraft Paper",
        "Edge Crush Test (ECT)": "44 ECT",
        Usage: "Industrial Parts, Appliances, Glassware, Exports",
      },
      seo: {
        metaTitle: "5 Ply Corrugated Box | Double Wall Heavy Duty Packaging | QuickPack India",
        metaDescription: "Factory direct 5 ply heavy duty corrugated boxes for bulk transit.",
        focusKeyword: "5 Ply Corrugated Box",
        canonicalUrl: "/products/5-ply-corrugated-box",
      },
    });

    await ProductVariant.insertMany([
      { productId: product3._id, sku: "QP-5PLY-BRN-100", options: { topPaper: "Brown", packQuantity: 100 }, price: 1250, compareAtPrice: 1450, unitPricePerBox: 12.5, stock: 4000, isActive: true },
      { productId: product3._id, sku: "QP-5PLY-BRN-500", options: { topPaper: "Brown", packQuantity: 500 }, price: 5800, compareAtPrice: 6800, unitPricePerBox: 11.6, stock: 4000, isActive: true },
      { productId: product3._id, sku: "QP-5PLY-BRN-1000", options: { topPaper: "Brown", packQuantity: 1000 }, price: 10900, compareAtPrice: 12900, unitPricePerBox: 10.9, stock: 4000, isActive: true },
      { productId: product3._id, sku: "QP-5PLY-WHT-100", options: { topPaper: "White", packQuantity: 100 }, price: 1450, compareAtPrice: 1700, unitPricePerBox: 14.5, stock: 4000, isActive: true },
      { productId: product3._id, sku: "QP-5PLY-WHT-500", options: { topPaper: "White", packQuantity: 500 }, price: 6800, compareAtPrice: 8000, unitPricePerBox: 13.6, stock: 4000, isActive: true },
    ]);

    // Product 4: Premium Kraft Mailer Box
    const product4 = await Product.create({
      name: "Premium Kraft Mailer Box",
      slug: "premium-kraft-mailer-box",
      sku: "QP-MAILER-KRAFT",
      shortDescription:
        "Sturdy flip-lid die-cut mailer box that locks securely without tape for luxury unboxing.",
      description:
        "Manufactured with clean die-cut edges and double side-wall folds for maximum rigidity. Perfect for direct-to-consumer brands, cosmetics, apparel, and curated gift hampers.",
      category: createdCategories["mailer-boxes"],
      thumbnail: "/assets/mailer-boxes.jpg",
      images: [{ url: "/assets/mailer-boxes.jpg", alt: "Premium Kraft Mailer Box", isPrimary: true }],
      basePrice: 1150.0,
      compareAtPrice: 1350.0,
      minPrice: 1150.0,
      maxPrice: 42000.0,
      rating: 4.9,
      reviewCount: 29,
      stock: 25000,
      isActive: true,
      isFeatured: true,
      tags: ["mailer", "die-cut", "unboxing"],
      specifications: {
        "Box Type": "Front Tuck Mailer (Roll End Tuck Front)",
        Material: "Virgin Kraft Liner",
        Assembly: "Snap & Fold (No adhesive tape required)",
        Print: "Inside & Outside Custom Printing Available",
      },
      seo: {
        metaTitle: "Premium Kraft Mailer Boxes for E-commerce | QuickPack India",
        metaDescription: "Flip-lid mailer boxes with luxury finish. Factory direct supplier.",
        focusKeyword: "Premium Kraft Mailer Box",
        canonicalUrl: "/products/premium-kraft-mailer-box",
      },
    });

    await ProductVariant.insertMany([
      { productId: product4._id, sku: "QP-MLR-BRN-100", options: { topPaper: "Brown", packQuantity: 100 }, price: 1150, compareAtPrice: 1350, unitPricePerBox: 11.5, stock: 3000, isActive: true },
      { productId: product4._id, sku: "QP-MLR-BRN-500", options: { topPaper: "Brown", packQuantity: 500 }, price: 5200, compareAtPrice: 6100, unitPricePerBox: 10.4, stock: 3000, isActive: true },
      { productId: product4._id, sku: "QP-MLR-WHT-100", options: { topPaper: "White", packQuantity: 100 }, price: 1350, compareAtPrice: 1590, unitPricePerBox: 13.5, stock: 3000, isActive: true },
      { productId: product4._id, sku: "QP-MLR-WHT-500", options: { topPaper: "White", packQuantity: 500 }, price: 6100, compareAtPrice: 7200, unitPricePerBox: 12.2, stock: 3000, isActive: true },
      { productId: product4._id, sku: "QP-MLR-PRT-500", options: { topPaper: "Logo Printed", packQuantity: 500 }, price: 7400, compareAtPrice: 8800, unitPricePerBox: 14.8, stock: 3000, isActive: true },
    ]);

    // Product 5: Cosmetic Mono Carton Box
    const product5 = await Product.create({
      name: "Cosmetic Mono Carton Box",
      slug: "cosmetic-mono-carton-box",
      sku: "QP-MONO-COSMETIC",
      shortDescription:
        "High-definition printed duplex folding mono carton for cosmetics, personal care, and retail shelves.",
      description:
        "Our mono carton folding boxes are precision printed on high-bulk SBS / FBB paperboard with optional spot UV, matte/gloss lamination, and gold foil stamping for standout retail shelf presence.",
      category: createdCategories["mono-cartons"],
      thumbnail: "/assets/mono-carton.jpg",
      images: [{ url: "/assets/mono-carton.jpg", alt: "Cosmetic Mono Carton Box", isPrimary: true }],
      basePrice: 450.0,
      compareAtPrice: 550.0,
      minPrice: 450.0,
      maxPrice: 18000.0,
      rating: 4.7,
      reviewCount: 16,
      stock: 50000,
      isActive: true,
      isFeatured: true,
      tags: ["mono-carton", "printed", "cosmetics"],
      specifications: {
        Board: "300 - 400 GSM SBS / Cyber Xpress Paperboard",
        Printing: "6-Color Heidelberg UV Offset",
        Finishing: "Matte Velvet Lamination + Spot UV",
        Opening: "Tuck Top, Auto-Lock Bottom",
      },
      seo: {
        metaTitle: "Cosmetic Mono Carton Box Manufacturer | QuickPack India",
        metaDescription: "Custom printed duplex mono cartons for cosmetics and personal care.",
        focusKeyword: "Cosmetic Mono Carton Box",
        canonicalUrl: "/products/cosmetic-mono-carton-box",
      },
    });

    await ProductVariant.insertMany([
      { productId: product5._id, sku: "QP-MNO-500", options: { topPaper: "Logo Printed", packQuantity: 500 }, price: 1850, compareAtPrice: 2200, unitPricePerBox: 3.7, stock: 5000, isActive: true },
      { productId: product5._id, sku: "QP-MNO-1000", options: { topPaper: "Logo Printed", packQuantity: 1000 }, price: 3400, compareAtPrice: 4100, unitPricePerBox: 3.4, stock: 5000, isActive: true },
      { productId: product5._id, sku: "QP-MNO-3000", options: { topPaper: "Logo Printed", packQuantity: 3000 }, price: 9300, compareAtPrice: 11400, unitPricePerBox: 3.1, stock: 5000, isActive: true },
    ]);

    // 4. Seed Dynamic Packaging Blogs
    await Blog.create([
      {
        title: "How to Choose the Right Corrugated Box for E-Commerce Shipping",
        slug: "how-to-choose-the-right-corrugated-box",
        excerpt:
          "A comprehensive guide comparing 3-ply, 5-ply, fluting types, and dimensions to minimize shipping damage and cut volumetric weight costs.",
        content: `
          <h2>Understanding Corrugated Box Ply Strength</h2>
          <p>Choosing the right packaging is crucial for e-commerce brands in India. A damaged box during transit not only results in product loss but damages customer trust and spikes return-to-origin (RTO) costs.</p>
          <h3>1. When to Use 3-Ply Corrugated Boxes</h3>
          <p>3-ply boxes feature a single fluted corrugated medium sandwiched between two linerboards. They are ideal for lightweight items under 3 kg such as cosmetics, t-shirts, phone accessories, and small books.</p>
          <h3>2. When to Upgrade to 5-Ply Packaging</h3>
          <p>5-ply boxes feature two fluted mediums providing dual-wall cushioning. If your consignment weighs between 4 kg and 15 kg, contains fragile glass or electronics, 5-ply is the industry benchmark for zero transit damage.</p>
          <h2>Key Factors in Selecting Packaging Dimensions</h2>
          <p>To avoid volumetric weight surcharges from courier partners like BlueDart, Delhivery, and Shiprocket, ensure your box leaves no more than 1 cm of clearance around your product when packed with appropriate filler.</p>
          <h2>Frequently Asked Questions</h2>
          <h4>Q1: What is the difference between Kraft paper and Semi-Kraft paper?</h4>
          <p>Virgin Kraft paper is made from virgin wood pulp offering higher tear strength, moisture resistance, and a rich golden brown color, while Semi-Kraft contains recycled fibers.</p>
        `,
        featuredImage: "/assets/corrugated-boxes.jpg",
        author: "Prashant Sharma, Packaging Engineer",
        category: createdCategories["corrugated-boxes"],
        tags: ["shipping-guide", "corrugated-boxes", "ecommerce-tips"],
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        readingTime: 6,
        relatedProducts: [product1._id, product2._id, product3._id],
        seo: {
          seoTitle: "How to Choose the Right Corrugated Box for E-Commerce | QuickPack India",
          metaDescription:
            "Learn how to choose between 3-ply and 5-ply corrugated boxes to eliminate transit damage and save courier costs.",
          focusKeyword: "choose corrugated box",
          canonicalUrl: "/blog/how-to-choose-the-right-corrugated-box",
        },
      },
      {
        title: "3 Ply vs 5 Ply Corrugated Boxes: Complete Cost & Strength Comparison",
        slug: "3-ply-vs-5-ply-corrugated-boxes",
        excerpt:
          "Detailed breakdown of bursting strength, stacking capacity, and price per box between single-wall and double-wall corrugated cartons.",
        content: `
          <h2>Single Wall (3-Ply) vs Double Wall (5-Ply) Comparison</h2>
          <p>Corrugated packaging represents the structural backbone of Indian logistics. Here is how 3-ply and 5-ply boxes stack up in real-world factory performance tests.</p>
          <table>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>3 Ply (Single Wall)</th>
                <th>5 Ply (Double Wall)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Flute Structure</td>
                <td>Single B or C Flute</td>
                <td>Combined A+B or B+C Flute</td>
              </tr>
              <tr>
                <td>Weight Capacity</td>
                <td>Up to 4 kg</td>
                <td>Up to 20 kg</td>
              </tr>
              <tr>
                <td>Bursting Strength</td>
                <td>10 - 14 kg/cm²</td>
                <td>18 - 24 kg/cm²</td>
              </tr>
              <tr>
                <td>Best For</td>
                <td>Apparel, books, accessories</td>
                <td>Heavy machinery parts, glassware, exports</td>
              </tr>
            </tbody>
          </table>
          <p>For custom size orders, reach out to QuickPack India's manufacturing team for direct-from-factory quotes.</p>
        `,
        featuredImage: "/assets/corrugated-boxes.jpg",
        author: "QuickPack Editorial Team",
        category: createdCategories["corrugated-boxes"],
        tags: ["comparison", "ply-strength", "manufacturing"],
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        readingTime: 5,
        relatedProducts: [product2._id, product3._id],
        seo: {
          seoTitle: "3 Ply vs 5 Ply Corrugated Boxes Comparison | QuickPack India",
          metaDescription: "Understand the differences in strength and cost between 3 ply and 5 ply boxes.",
          focusKeyword: "3 ply vs 5 ply",
          canonicalUrl: "/blog/3-ply-vs-5-ply-corrugated-boxes",
        },
      },
      {
        title: "The Power of Custom Mailer Boxes in Brand Unboxing Experience",
        slug: "power-of-custom-mailer-boxes-unboxing",
        excerpt:
          "Why direct-to-consumer brands are switching to self-locking die-cut mailer boxes with custom logo printing to increase repeat purchases.",
        content: `
          <h2>Why First Impressions Matter in Modern E-Commerce</h2>
          <p>In digital commerce, the delivery box is the only physical touchpoint between your brand and your customer. A generic brown carton taped hastily creates a low-value impression, while a sleek flip-lid mailer box creates excitement and shareable unboxing moments.</p>
          <h3>Benefits of Die-Cut Mailers:</h3>
          <ul>
            <li><strong>No Tape Required:</strong> Front-locking tuck flaps seal cleanly and open effortlessly.</li>
            <li><strong>Flat Shipping:</strong> Delivered flat to save valuable warehouse storage space.</li>
            <li><strong>Brand Canvas:</strong> Full exterior and interior custom printing available at QuickPack India.</li>
          </ul>
        `,
        featuredImage: "/assets/mailer-boxes.jpg",
        author: "Sneha Kapur, Brand Strategist",
        category: createdCategories["mailer-boxes"],
        tags: ["mailer-boxes", "unboxing", "branding"],
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        readingTime: 4,
        relatedProducts: [product4._id, product1._id],
        seo: {
          seoTitle: "Custom Mailer Boxes for Unboxing | QuickPack India",
          metaDescription: "Elevate your brand with premium die-cut mailer boxes and custom printing.",
          focusKeyword: "custom mailer boxes",
          canonicalUrl: "/blog/power-of-custom-mailer-boxes-unboxing",
        },
      },
    ]);

    // 5. Seed Promotional Coupons
    await Coupon.create([
      {
        code: "WELCOME10",
        discountType: "PERCENT",
        discountValue: 10,
        minimumOrder: 500,
        maximumDiscount: 200,
        usageLimit: 5000,
        isActive: true,
      },
      {
        code: "FLAT100",
        discountType: "FLAT",
        discountValue: 100,
        minimumOrder: 1000,
        usageLimit: 2000,
        isActive: true,
      },
      {
        code: "BULK500",
        discountType: "FLAT",
        discountValue: 500,
        minimumOrder: 5000,
        maximumDiscount: 500,
        usageLimit: 1000,
        isActive: true,
      },
    ]);

    // 6. Seed Pincodes
    const pincodesData = [
      { pincode: "110001", city: "Connaught Place, New Delhi", state: "Delhi", estimatedDaysMin: 1, estimatedDaysMax: 2, isServiceable: true, expressAvailable: true },
      { pincode: "110020", city: "Okhla Industrial Area, New Delhi", state: "Delhi", estimatedDaysMin: 1, estimatedDaysMax: 2, isServiceable: true, expressAvailable: true },
      { pincode: "122002", city: "DLF Cyber City, Gurugram", state: "Haryana", estimatedDaysMin: 1, estimatedDaysMax: 2, isServiceable: true, expressAvailable: true },
      { pincode: "201301", city: "Sector 18, Noida", state: "Uttar Pradesh", estimatedDaysMin: 1, estimatedDaysMax: 2, isServiceable: true, expressAvailable: true },
      { pincode: "400001", city: "Fort, Mumbai", state: "Maharashtra", estimatedDaysMin: 2, estimatedDaysMax: 3, isServiceable: true, expressAvailable: true },
      { pincode: "400069", city: "Andheri East, Mumbai", state: "Maharashtra", estimatedDaysMin: 2, estimatedDaysMax: 3, isServiceable: true, expressAvailable: true },
      { pincode: "560001", city: "MG Road, Bengaluru", state: "Karnataka", estimatedDaysMin: 2, estimatedDaysMax: 4, isServiceable: true, expressAvailable: true },
      { pincode: "600001", city: "George Town, Chennai", state: "Tamil Nadu", estimatedDaysMin: 2, estimatedDaysMax: 4, isServiceable: true, expressAvailable: true },
      { pincode: "700001", city: "BBD Bagh, Kolkata", state: "West Bengal", estimatedDaysMin: 2, estimatedDaysMax: 4, isServiceable: true, expressAvailable: true },
      { pincode: "302001", city: "MI Road, Jaipur", state: "Rajasthan", estimatedDaysMin: 2, estimatedDaysMax: 3, isServiceable: true, expressAvailable: true },
    ];
    await Pincode.insertMany(pincodesData);

    // 7. Seed Global SEO Settings
    await SeoSettings.create({});

    console.log("[Seed] Sample products, variants, users, blogs, coupons, and pincodes populated successfully!");
  } catch (error: any) {
    console.error("[Seed Error]:", error.message);
  }
}

export async function seedB2BIfEmpty(): Promise<void> {
  try {
    const customOrderCount = await CustomOrder.countDocuments();
    if (customOrderCount > 0) {
      return;
    }

    console.log("[Seed] Populating initial B2B manufacturing orders and quotations...");

    // Find or pick a user for B2B relationship
    let businessUser = await User.findOne({ email: "rahul.sharma@example.com" });
    if (!businessUser) {
      businessUser = await User.findOne({ role: "USER" });
    }

    if (businessUser) {
      businessUser.role = "BUSINESS";
      businessUser.businessProfile = {
        companyName: "Sharma Logistics & Packaging Solutions",
        gstin: "07AAACS1429B1ZB",
        pan: "AAACS1429B",
        contactPerson: businessUser.name || "Rahul Sharma",
        creditLimit: 500000,
        isVerified: true,
      };
      await businessUser.save();
    }

    const userId = businessUser ? businessUser._id : undefined;

    // 1. Seed Custom Manufacturing Order (e.g. 10,000 custom printed mailer boxes)
    const customOrder = await CustomOrder.create({
      orderNumber: "B2B-10024",
      userId,
      customerName: "Rahul Sharma",
      companyName: "Sharma Logistics & Packaging Solutions",
      email: "rahul.sharma@example.com",
      phone: "+91 98765 43210",
      gstin: "07AAACS1429B1ZB",
      deliveryAddress: {
        fullName: "Rahul Sharma",
        phone: "+91 98765 43210",
        houseFlat: "Warehouse Unit 4",
        street: "Cyber City Boulevard",
        area: "DLF Phase 2",
        city: "Gurugram",
        state: "Haryana",
        pincode: "122002",
        landmark: "Opposite Cyber Hub",
      },
      specifications: {
        productType: "Premium Die-Cut Mailer Box",
        dimensions: { length: 8, width: 5, height: 2.5, unit: "inch" },
        boardGrade: "3 Ply E-Flute White Kraft",
        printing: "2 Color Flexo (Navy Blue & Gold)",
        finish: "Matte Lamination",
        quantity: 10000,
      },
      designFiles: [
        {
          version: 1,
          fileUrl: "/assets/mailer-boxes.jpg",
          fileName: "sharma_mailer_artwork_v1.pdf",
          fileType: "application/pdf",
          uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          uploadedBy: "CUSTOMER",
          approvalStatus: "APPROVED",
          approvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          approvedBy: "Rahul Sharma",
          notes: "Approved color proof and box dieline dimensions.",
        },
      ],
      approvedDesignVersion: 1,
      designApprovalStatus: "APPROVED",
      pricing: {
        unitPrice: 14.5,
        subtotal: 145000,
        taxRate: 18,
        taxAmount: 26100,
        shippingCharge: 0,
        totalAmount: 171100,
        advanceRequired: 85550,
        advancePaid: 85550,
        totalPaid: 85550,
        balanceDue: 85550,
      },
      paymentStatus: "PARTIALLY_PAID",
      orderStatus: "IN_PRODUCTION",
      paymentRecords: [
        {
          paymentId: "PAY-ADV-001",
          amount: 85550,
          paymentMethod: "BANK_TRANSFER",
          transactionReference: "NEFT-HDFC-992182041",
          status: "VERIFIED",
          recordedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          verifiedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          verifiedBy: "QuickPack Accounts",
          notes: "50% manufacturing advance verified in HDFC Current A/c.",
        },
      ],
      documents: [
        {
          docType: "INVOICE",
          title: "Proforma Invoice INV-B2B-10024",
          fileUrl: "/assets/factory.jpg",
          uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          size: 142000,
        },
        {
          docType: "RECEIPT",
          title: "Advance Payment Receipt RCPT-85550",
          fileUrl: "/assets/factory.jpg",
          uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          size: 98000,
        },
        {
          docType: "APPROVED_ARTWORK",
          title: "Approved Dieline & Proof PDF",
          fileUrl: "/assets/mailer-boxes.jpg",
          uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          size: 345000,
        },
      ],
      statusTimeline: [
        {
          status: "ENQUIRY_RECEIVED",
          timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          note: "Enquiry received for 10,000 custom die-cut mailer boxes.",
          updatedBy: "System",
          isCustomerVisible: true,
        },
        {
          status: "AWAITING_DESIGN_APPROVAL",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          note: "Design proof v1 uploaded for customer approval.",
          updatedBy: "QuickPack Design Team",
          isCustomerVisible: true,
        },
        {
          status: "APPROVED_FOR_PRODUCTION",
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          note: "Design approved and 50% advance payment reconciled.",
          updatedBy: "Admin",
          isCustomerVisible: true,
        },
        {
          status: "IN_PRODUCTION",
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          note: "Corrugation, die-cutting and 2-color flexographic printing running on Line 2.",
          updatedBy: "Factory Production Mgr",
          isCustomerVisible: true,
        },
      ],
      dates: {
        orderDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        designApprovedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        productionStartDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        estimatedCompletionDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      },
      notes: "Custom packaging batch for e-commerce client unboxing experience.",
      internalNotes: "Board procured from Star Paper Mills. Die #M-852 reserved on Machine B.",
      isRepeatOrder: false,
    });

    // 2. Seed Formal Quotation (e.g. 5,000 5-ply shipping boxes)
    await Quotation.create({
      quotationNumber: "QUO-2026-088",
      userId,
      customerName: "Rahul Sharma",
      companyName: "Sharma Logistics & Packaging Solutions",
      email: "rahul.sharma@example.com",
      phone: "+91 98765 43210",
      productType: "Heavy Duty 5-Ply Shipping Box",
      dimensions: { length: 12, width: 10, height: 8, unit: "inch" },
      boardGrade: "5 Ply (B+C Flute) 180 GSM Virgin Kraft",
      printing: "1 Color Black Logo",
      finish: "None",
      quantity: 5000,
      unitPrice: 28.5,
      subtotal: 142500,
      taxRate: 18,
      taxAmount: 25650,
      shippingCharge: 0,
      totalAmount: 168150,
      advancePercent: 50,
      advanceAmount: 84075,
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      estimatedLeadDays: 8,
      status: "SENT",
      notes: "Specially engineered for warehouse stacking and multi-tier transit.",
      internalNotes: "Plate ready from past run.",
    });

    // 3. Seed Customer Ledger
    if (userId) {
      await CustomerLedger.create([
        {
          userId,
          companyName: "Sharma Logistics & Packaging Solutions",
          orderId: customOrder._id,
          orderNumber: customOrder.orderNumber,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          transactionType: "INVOICE",
          referenceNumber: "INV-B2B-10024",
          description: "Order Invoice #B2B-10024: 10,000 pcs Premium Die-Cut Mailer Box",
          debit: 171100,
          credit: 0,
          runningBalance: 171100,
          reconciled: true,
        },
        {
          userId,
          companyName: "Sharma Logistics & Packaging Solutions",
          orderId: customOrder._id,
          orderNumber: customOrder.orderNumber,
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          transactionType: "PAYMENT",
          referenceNumber: "NEFT-HDFC-992182041",
          description: "Advance received via Bank Transfer (Ref: NEFT-HDFC-992182041)",
          debit: 0,
          credit: 85550,
          runningBalance: 85550,
          reconciled: true,
          reconciledBy: "QuickPack Accounts",
        },
      ]);
    }

    console.log("[Seed] Initial B2B custom order #B2B-10024, quotation, and ledger populated successfully!");
  } catch (error: any) {
    console.error("[Seed B2B Error]:", error.message);
  }
}

