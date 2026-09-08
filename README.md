# Packaging Navigator

Website ka overall flow

khuch basic chiza also integrate = seo wise work inpage seo like meta data , alt everything ,

nextjs

navbar = home about products contact 

products = # 26. PRODUCTS NAVBAR DROPDOWN / MEGA MENU

Update the existing website header/navbar so that the Products navigation item has a professional dropdown/mega-menu.

The attached screenshot is a visual reference for the interaction and general structure.

The final QuickPack India implementation should be original and should use QuickPack India's own product categories.

---

NAVBAR STRUCTURE

The main navbar should contain:

* Home

* About Us

* Products ▼

* Contact Us

When the user hovers over or clicks Products, open a large dropdown/mega-menu.

The dropdown should appear directly below the Products navigation item.

---

27. PRODUCTS MEGA MENU LAYOUT

Use a two-column mega-menu similar to the attached reference.

LEFT COLUMN

The left column should display the currently selected/main category's products or important product shortcuts.

Example when Corrugated Packing Boxes is selected:

* 3 Ply Corrugated Box

* 5 Ply Corrugated Box

* 7 Ply Corrugated Box

* 9 Ply Corrugated Box

* Corrugated Carton Box

At the bottom of the left column, include:

View All →

Clicking `View All` should take the user to:

`/products`

---

28. RIGHT COLUMN – MAIN PRODUCT CATEGORIES

The right column should contain the main product categories.

Use:

Corrugated Packing Boxes

→

Paper Bags

→

Premium Mailer Boxes

→

Mono Carton Packaging Boxes

→

Other Products

The arrow should indicate that the category has sub-products.

---

29. CATEGORY HOVER INTERACTION

The mega-menu should behave intelligently.

When the user hovers over a category on the right side, the left side should update and show the relevant products.

Example:

Hover: Corrugated Packing Boxes

Left side displays:

* 3 Ply Corrugated Box

* 5 Ply Corrugated Box

* 7 Ply Corrugated Box

* 9 Ply Corrugated Box

* Corrugated Carton Box

Hover: Paper Bags

Left side displays:

* Eco Friendly Paper Bag

* Printed Paper Bag

Hover: Premium Mailer Boxes

Left side displays:

* Corrugated Mailer Box

* Custom Mailer Box

* Folding Mailer Box

* Kraft Mailer Box

* Luxury Packaging Mailer Box

Hover: Mono Carton Packaging Boxes

Left side displays:

* Cosmetic Mono Carton Box

* Earpod Mono Carton Packaging Box

* Mono Carton Packaging Box

* Printed Mono Carton Box

Hover: Other Products

Left side displays:

* Thank You Card

* Premium Business Card

* Shredded Paper

* Round Paper Sticker

* Promotional Paper Pamphlet

---

30. CATEGORY LINKS

Every category should be clickable.

Corrugated Packing Boxes

Should navigate to the Corrugated Packing Boxes section/filter on:

`/products`

Paper Bags

Should navigate to the Paper Bags section/filter.

Premium Mailer Boxes

Should navigate to the Premium Mailer Boxes section/filter.

Mono Carton Packaging Boxes

Should navigate to the Mono Carton Packaging section/filter.

Other Products

Should navigate to the Other Products section/filter.

Prefer using query parameters or URL hash/category state if the existing routing architecture supports it.

For example:

`/products?category=corrugated`

or

`/products#corrugated-packing-boxes`

Choose the approach that best fits the existing project architecture.

---

31. PRODUCT LINKS INSIDE DROPDOWN

Every product listed inside the mega-menu should also be clickable.

For example:

3 Ply Corrugated Box

→ `/products/3-ply-corrugated-box`

5 Ply Corrugated Box

→ `/products/5-ply-corrugated-box`

etc.

Reuse the existing product-detail routing if the application already has one.

Do not create duplicate routes.

---

32. VIEW ALL

At the bottom of the dropdown, include a prominent:

View All Products →

Clicking it must navigate to:

`/products`

This should open the complete Products page.

---

33. DROPDOWN DESIGN

The dropdown should look premium and professional.

Requirements:

* White or existing website background.

* Subtle border/shadow.

* Rounded corners where consistent with the existing design.

* Clear separation between columns.

* Good spacing.

* Easy-to-read typography.

* Category hover state.

* Product hover state.

* Smooth but subtle transition.

* No excessive animation.

The dropdown should not cover the entire screen unnecessarily.

Use an appropriate max-width based on the existing navbar/container.

---

34. ACTIVE CATEGORY

If the user is currently browsing:

`/products`

the Products navbar item should have an active state.

If the user is browsing a specific product category/detail page, the Products item should remain visually active.

---

35. DESKTOP BEHAVIOUR

On desktop:

* Hovering over `Products` opens the mega-menu.

* Moving the mouse into the dropdown should keep it open.

* Moving away should close it.

* Clicking Products can also open the menu.

* Clicking a product/category should navigate normally.

Avoid flickering when moving the mouse between the navbar and dropdown.

---

36. MOBILE BEHAVIOUR

On mobile, do NOT use a hover-only dropdown.

The Products navigation item should behave as an accordion/collapsible menu.

Example:

Products +

When tapped:

Products −

Then show:

All Products

Corrugated Packing Boxes

* 3 Ply Corrugated Box

* 5 Ply Corrugated Box

* 7 Ply Corrugated Box

* 9 Ply Corrugated Box

* View All

Paper Bags

* Eco Friendly Paper Bag

* Printed Paper Bag

Premium Mailer Boxes

* Corrugated Mailer Box

* Custom Mailer Box

* Folding Mailer Box

* Kraft Mailer Box

* Luxury Packaging Mailer Box

Mono Carton Packaging Boxes

* Cosmetic Mono Carton Box

* Earpod Mono Carton Packaging Box

* Mono Carton Packaging Box

* Printed Mono Carton Box

Other Products

* Thank You Card

* Premium Business Card

* Shredded Paper

* Round Paper Sticker

* Promotional Paper Pamphlet

Make the mobile menu easy to scroll and use with touch.

---

37. ALL PRODUCTS OPTION

At the top of the Products dropdown, include:

All Products

This should link directly to:

`/products`

It should be visually prominent.

---

38. SINGLE SOURCE OF PRODUCT DATA

IMPORTANT:

Do not manually maintain separate product lists for:

* Products page

* Navbar dropdown

* Product filters

* Product cards

* Product detail pages

Create/use one centralized product data source.

The navbar mega-menu should dynamically derive its categories and products from the same product data used by `/products`.

This means:

If a new product is added later to the product data, it should be possible to make it automatically appear in the appropriate category/filter/dropdown without manually editing multiple components.

---

39. PRODUCT CATEGORY DATA STRUCTURE

Use a scalable structure similar to:

```text

categories

│

├── Corrugated Packing Boxes

│   ├── 3 Ply Corrugated Box

│   ├── 5 Ply Corrugated Box

│   ├── 7 Ply Corrugated Box

│   ├── 9 Ply Corrugated Box

│   ├── Corrugated Carton Box

│   ├── Corrugated Packaging Box

│   ├── Custom Corrugated Box

│   ├── Heavy Duty Corrugated Box

│   ├── Industrial 7 Ply Corrugated Box

│   ├── Multi Layer Corrugated Box

│   ├── Premium Imported Kraft Corrugated Boxes

│   └── Printed Corrugated Box

│

├── Paper Bags

│   ├── Eco Friendly Paper Bag

│   └── Printed Paper Bag

│

├── Premium Mailer Boxes

│   ├── Corrugated Mailer Box

│   ├── Custom Mailer Box

│   ├── Folding Mailer Box

│   ├── Kraft Mailer Box

│   └── Luxury Packaging Mailer Box

│

├── Mono Carton Packaging Boxes

│   ├── Cosmetic Mono Carton Box

│   ├── Earpod Mono Carton Packaging Box

│   ├── Mono Carton Packaging Box

│   └── Printed Mono Carton Box

│

└── Other Products

    ├── Thank You Card

    ├── Premium Business Card

    ├── Shredded Paper

    ├── Round Paper Sticker

    └── Promotional Paper Pamphlet

```

The exact implementation should follow the existing project's architecture.

---

40. IMPORTANT – DO NOT BREAK EXISTING HEADER

Before modifying the navbar:

* Inspect the existing header component.

* Reuse the current logo.

* Preserve existing navigation.

* Preserve Contact Us.

* Preserve mobile navigation.

* Preserve existing responsive behaviour.

* Preserve existing WhatsApp/floating buttons.

* Do not replace the entire header unless necessary.

Only enhance the Products navigation with the new mega-menu.

---

41. FINAL UX GOAL

The user should be able to discover products in three simple ways:

Method 1

Navbar → Products → Category → Product

Method 2

Products page → Search

Method 3

Products page → Category Filter → Product Card → View More

All three methods must use the same centralized product data.

The final experience should feel like a professional packaging catalogue and should make it very easy for a customer to reach any QuickPack India product within a few clicks.

 

1. Hero / Product Carousel

Top banner ke andar horizontally sliding product cards.

Har card mein:

Real/product image

Product name

View Details button

Products:

3 Ply Corrugated Box

Printed Mono Carton Box

5 Ply Corrugated Box

Earpod Mono Carton Packaging Box

Printed Paper Bag

Carousel automatically slide kare, but user manually bhi navigate kar sake.

Responsive on desktop/tablet/mobile.

2. Our Product Range

Ek dedicated component:

Our Product Range

Isme category-wise cards honge:

Corrugated Packing Boxes

3 Ply Corrugated Box

5 Ply Corrugated Box

7 Ply Corrugated Box

9 Ply Corrugated Box

Premium Mailer Boxes

Corrugated Mailer Box

Custom Mailer Box

Folding Mailer Box

Kraft Mailer Box

Mono Carton Packaging Boxes

Cosmetic Mono Carton Box

Earpod Mono Carton Packaging Box

Mono Carton Packaging Box

Printed Mono Carton Box

Paper Bags

Eco Friendly Paper Bag

Printed Paper Bag

Har category mein:

Category image

Category heading

Uske niche related product types

Clean card-based layout

3. Existing Product Data — VERY IMPORTANT

Ye instruction Antigravity prompt mein strongly mention karni chahiye:

Do NOT replace, delete, modify, rename, or regenerate any existing real product images, product content, product data, or routes.

Tumhare existing project mein:

/products

route already available hai aur usme real product images + real product content use ho raha hai.

Is existing data ko preserve karna hai.

Agar possible ho to same existing product data ko new Product Range, carousel aur All Products sections mein reuse karo, instead of creating duplicate/fake product data.

No placeholder images.

No stock images.

No dummy product names.

No lorem ipsum.

4. About Section

Product sections ke immediately baad About Us section aayega.

Reason bhi prompt mein explain kar sakte hain:

The website should prioritize product discovery. Users should be able to understand and explore QuickPackIndia's

 products immediately from the hero and product-range sections. The About section should come after the primary

 product discovery sections.

ya raha hamara about section ka data jo last website pa hai isma sa jo acha laga wo laga do 

About Quickpack India

Crafting reliable packaging for every industry.

Quickpack India is a leading packaging manufacturer delivering high-quality 

corrugated boxes, mono cartons, and custom packaging solutions across industries

. Previously known as Krishna Packers, we've built a legacy of trust since 1991. 

About Us

Three decades of building India's packaging backbone.

From a small workshop in 1991 to a trusted name across industries — the Quickpack India story is one of consistency, craftsmanship and customer obsession.

Our Story

Since 1991, we've been packing India's growth.

Established in 1991 as Krishna Packers, our journey began with a simple promise — make packaging that doesn't fail. Three decades on, that promise is still the heartbeat of Quickpack India.

Today, we serve hundreds of clients across e-commerce, FMCG, pharma, electronics, logistics and exports. Our facility in Delhi NCR runs on modern machinery, strict quality protocols and a team that genuinely cares about your shipment arriving safely.

We don't just sell boxes. We build packaging systems that protect products, project brands and improve unit economics for our clients.

isma sa ya hamara about page ka banner hai tha to wahi laga dena = About Us

Three decades of building India's packaging backbone.

From a small workshop in 1991 to a trusted name across industries — the Quickpack India story is one of consistency, craftsmanship and customer obsession.

aboutpage

QuickPack India – About Us Page

Update the existing QuickPack India website by creating/improving the About Us page using the attached competitor screenshots only as a visual and structural reference.

The goal is to create a professional, trustworthy and modern About Us page for a real Indian packaging manufacturer. The page should feel similar in terms of information hierarchy and layout quality to the reference website, but DO NOT copy the competitor's text, branding, images, HTML, CSS, or exact design.

Use QuickPack India's own branding, content and business information.

---

1. IMPORTANT: EXISTING WEBSITE MUST NOT BE BROKEN

This is an existing website/codebase.

Before making changes:

* Inspect the current project structure.

* Reuse the existing components, styling system, routing and design language wherever appropriate.

* Do not unnecessarily rewrite the entire application.

* Do not remove existing functionality.

* Do not change existing working routes unless specifically required.

* Do not replace existing real product data or product images.

* Do not create fake/placeholder product data where real data already exists.

* Maintain the existing `/products` route and all of its real product content and images.

* The About page should integrate naturally with the existing website.

---

2. ABOUT PAGE HERO / BANNER

At the top of the About Us page, create a strong full-width About Us hero/banner.

Use this exact content:

About Us

Three decades of building India's packaging backbone.

From a small workshop in 1991 to a trusted name across industries — the QuickPack India story is one of consistency, craftsmanship and customer obsession.

The banner should look premium and professional.

Suggested visual direction:

* Packaging/manufacturing-related visual treatment.

* Clean typography.

* Strong heading hierarchy.

* Professional industrial/business feel.

* Subtle animation is acceptable.

* Do not use generic unrelated stock imagery.

* If an existing QuickPack India image is already available in the codebase, prefer reusing it.

* Keep the banner fully responsive.

---

3. ABOUT QUICKPACK INDIA INTRODUCTION

Immediately after the hero section, create a clean introduction section.

About QuickPack India

Crafting reliable packaging for every industry.

QuickPack India is a packaging manufacturer delivering high-quality corrugated boxes, mono cartons, and custom packaging solutions across industries.

Previously known as Krishna Packers, we've built a legacy of trust since 1991.

The section should have:

* A strong heading.

* Short introductory paragraph.

* Supporting packaging/manufacturing visual if available.

* Clean two-column layout on desktop.

* Stacked layout on mobile.

* Good whitespace.

* Professional typography.

Do not make this section overly large. The purpose is to quickly communicate who QuickPack India is.

---

4. OUR STORY SECTION

Create a dedicated section titled:

Our Story

Since 1991, we've been packing India's growth.

Use the following content:

Established in 1991 as Krishna Packers, our journey began with a simple promise — make packaging that doesn't fail. Three decades on, that promise is still the heartbeat of QuickPack India.

Today, we serve hundreds of clients across e-commerce, FMCG, pharma, electronics, logistics and exports. Our facility in Delhi NCR runs on modern machinery, strict quality protocols and a team that genuinely cares about your shipment arriving safely.

We don't just sell boxes. We build packaging systems that protect products, project brands and improve unit economics for our clients.

Design this section as a storytelling section rather than simply displaying a large block of text.

Possible layout:

* Text on one side.

* Packaging/manufacturing image or visual on the other.

* A subtle timeline/history visual can be used to highlight 1991 → Today.

* Keep it modern and easy to scan.

---

5. BUSINESS INFORMATION / COMPANY DETAILS

Take inspiration from the competitor screenshot where company information is displayed in a clean table.

Create a section such as:

Business Information

Display the following information in a professional responsive table/card layout:

| Information           | Details                          |

| --------------------- | -------------------------------- |

| Nature of Business    | Manufacturers, Supplier, Trader  |

| Number of Employees   | 0 - 5                            |

| Year of Establishment | 1991                             |

| Market Covered        | Pan India                        |

| GST No.               | 07AZTPS9770M2Z0                  |

| Annual Turnover       | Rs. 0.5 to 2.5 Crore Approx.     |

| Legal Status of Firm  | Individual (Sole Proprietorship) |

On desktop:

* Use a clean two-column table.

* Labels should be visually distinct from values.

* Maintain proper spacing and borders.

On mobile:

* Convert the table into stacked information cards or a responsive two-column structure.

* Make sure the GST number and other information remain readable without horizontal scrolling.

---

6. IMPORTANT: QUICKPACK INDIA vs KRISHNA TRADERS

This is extremely important.

The business's legal/GST name is:

Krishna Traders

The online/business brand is:

QuickPack India

Therefore, the website must NOT create confusion between the brand name and legal business name.

Use a professional clarification such as:

QuickPack India is the online brand/business identity of Krishna Traders.

Or, where appropriate:

QuickPack India, operated by Krishna Traders, provides packaging solutions to businesses across India.

The exact wording can be refined to fit the design, but the distinction between the online brand and legal business name must remain clear.

Do not incorrectly present "QuickPack India" as the GST/legal entity name.

Do not change the GST number provided above.

---

7. TRUST / EXPERIENCE SECTION

Add a visually engaging section highlighting the company's experience and strengths.

Possible highlights:

30+ Years

Packaging experience since 1991

Pan India

Serving customers across India

Multiple Industries

E-commerce, FMCG, Pharma, Electronics, Logistics & Exports

Reliable Packaging

Focused on quality, protection and consistency

These should be displayed as modern statistic/trust cards.

Do not invent unsupported numbers such as number of employees, production capacity, factories, machines, orders, revenue, certifications, etc.

Only use facts provided in this prompt or facts already present in the existing QuickPack India website.

---

8. INDUSTRIES WE SERVE

Add an optional section introducing the industries QuickPack India serves.

Heading:

Industries We Serve

Use:

* E-commerce

* FMCG

* Pharmaceuticals

* Electronics

* Logistics

* Exports

Use clean cards/icons/visuals.

The design should communicate that QuickPack India provides packaging solutions for different business requirements.

Do not make unsupported claims.

---

9. PRODUCT CONNECTION

The About page should naturally connect back to the product range.

Near the lower part of the page, add a CTA section such as:

Packaging Built Around Your Business

From corrugated boxes and mailer boxes to mono cartons and paper bags, explore our complete packaging range.

CTA buttons:

Explore Our Products

and optionally:

Get a Quote

The `Explore Our Products` button should link to the existing `/products` route.

Do not create a duplicate product database.

---

10. CONTACT / ENQUIRY CTA

Before the footer, add a simple CTA section.

Suggested content:

Looking for the right packaging solution?

Tell us what you need and our team can help you find the right packaging solution for your business.

Buttons:

Get a Quote

Contact Us

Use the existing contact/enquiry functionality if it already exists in the project.

Do not create a fake backend or fake form submission.

---

11. DESIGN DIRECTION

The attached competitor screenshots show the general reference style.

Take inspiration from:

* Clean business layout

* Strong About Us heading

* Company story

* Company information table

* Product connection

* Professional footer

* Clear navigation

* Good whitespace

* Easy-to-scan information hierarchy

However, QuickPack India should have its own visual identity.

The final design should feel:

* Professional

* Trustworthy

* Modern

* Industrial

* Premium but not overly flashy

* Suitable for B2B packaging buyers

* Mobile responsive

* Fast-loading

Avoid:

* Excessive gradients

* Unnecessary animations

* Huge text blocks

* Random stock photos

* Fake statistics

* Fake testimonials

* Lorem ipsum

* Fake certifications

* Fake awards

* Fake company claims

---

12. NAVIGATION AND FOOTER

Keep the existing website's header/navigation unless changes are required for consistency.

The About Us page should clearly work with the existing navigation:

Home

About Us

Products

Contact Us

The existing footer should remain functional and visually consistent.

If the website already contains WhatsApp, enquiry, back-to-top or similar floating buttons, preserve them.

---

13. SEO

Implement proper SEO for the About Us page.

Suggested:

Title:

About QuickPack India | Corrugated Box & Packaging Manufacturer

Meta description:

Learn about QuickPack India, a packaging manufacturer delivering corrugated boxes, mono cartons and custom packaging solutions across India since 1991.

Use:

* One H1 only.

* Proper H2/H3 hierarchy.

* Semantic HTML.

* Descriptive image alt text.

* Avoid keyword stuffing.

---

14. RESPONSIVENESS

The page must work properly on:

* Desktop

* Laptop

* Tablet

* Mobile

Pay particular attention to:

* Hero banner

* Business information table

* Story section

* Trust cards

* CTA sections

* Images

* Navigation

* Typography

There must be no horizontal scrolling on mobile.

---

15. CONTENT RULES

Use the provided QuickPack India content as the source of truth.

Do not invent:

* Company history beyond the information provided.

* Certifications.

* Awards.

* Production capacity.

* Employee numbers.

* Customer counts beyond the provided "hundreds of clients".

* Factory locations other than the provided Delhi NCR information.

* Revenue figures other than the provided turnover.

* Manufacturing claims not supported by the provided information.

The content should sound confident but factual.

---

16. FINAL IMPLEMENTATION REQUIREMENT

Before finishing:

1. Inspect the existing codebase.

2. Identify the current routing structure.

3. Identify existing reusable components.

4. Identify existing QuickPack India branding/styles.

5. Implement the About Us page using reusable components.

6. Preserve the existing `/products` route and real product data/images.

7. Ensure navigation to `/products` works.

8. Ensure the page is responsive.

9. Ensure there are no console errors.

10. Ensure there are no broken images.

11. Ensure no placeholder content remains.

12. Ensure the legal name Krishna Traders and online brand QuickPack India are represented correctly.

13. Run/build the project and fix any errors introduced by the implementation.

The final result should look like a professionally designed About Us page for a real packaging company, taking structural inspiration from the attached competitor screenshots while remaining an original QuickPack India design.

 

Nature of Business	Manufacturers , Supplier , trader

Number of Employees	0 - 5

Year of Establishment	1991

Market Covered	Pan India

GST No	07AZTPS9770M2Z0

Annual Turnover	Rs. 0.5 to 2.5 Crore Approx.

Legal Status of Firm	Individual (Sole proprietorship)

QuickPack India – Products Page

Create/update the Products page of the existing QuickPack India website.

The Products page will be the main product showcase page where customers can browse the complete QuickPack India packaging range.

The page should be modern, clean, professional and highly usable, with a strong focus on product discovery.

The attached screenshot should be used as a UI/UX reference for the search bar and category filter section. Do not copy the competitor website's exact design, code, branding or content.

---

1. IMPORTANT – EXISTING CODEBASE

This is an existing website.

Before making changes:

* Inspect the existing project structure.

* Inspect the current `/products` route.

* Inspect the existing product data.

* Inspect where existing product images are stored.

* Reuse existing components and styling where possible.

* Do not unnecessarily rewrite the application.

* Do not break existing routes or functionality.

* Do not delete existing product data.

* Do not replace existing real product images with placeholders.

* Do not use fake product information.

The existing `/products` route already contains real QuickPack India product data/images.

Preserve all existing real data and images.

If the current product data can be reused for the new product cards, filters and product sections, reuse it instead of creating duplicate data.

---

2. PAGE STRUCTURE

The Products page should follow this structure:

1. Page Header / Intro

2. Search Bar

3. Category Filters

4. Product Categories

5. Product Cards

6. View More / Load More functionality

7. Additional Product Categories

8. CTA / Enquiry section

9. Existing Footer

The page should feel like a proper B2B packaging catalogue rather than a simple list of products.

---

3. PAGE HEADER

At the top of the Products page, create a clean heading section.

Products

Explore Our Complete Packaging Range

Add a short supporting line:

Discover reliable corrugated boxes, mailer boxes, mono cartons, paper bags and other packaging solutions designed for different business needs.

Keep this section compact.

Do not make the heading unnecessarily huge.

---

4. SEARCH BAR

Immediately below the page heading, create a large search bar similar in concept to the attached screenshot.

Placeholder:

Search by name or size...

The search bar should have:

* Search icon

* Rounded corners

* Clean border

* Comfortable height

* Full available width

* Professional typography

Search functionality

The search must actually work.

Users should be able to search products by:

* Product name

* Product category

* Product type

* Size/dimensions if size information exists in the product data

Example:

Searching:

`3 ply`

should show relevant 3 Ply Corrugated Box products.

Searching:

`mailer`

should show mailer box products.

Searching:

`paper`

should show relevant paper products.

Search should update results dynamically without requiring a page reload.

If there is no matching product, show a clean message:

No products found

with an option to clear the search.

---

5. CATEGORY FILTERS

Below the search bar, create horizontally arranged pill-style filter buttons inspired by the attached screenshot.

Initial categories:

* All

* 3 Ply Corrugated Boxes

* 5 Ply Corrugated Boxes

* Die Cut & Folding Boxes

* Printed Packaging Boxes

* Mailer Boxes

* Mono Carton Packaging

* Paper Bags

* Other Products

The filters should be horizontally scrollable on mobile.

Desktop:

* Display filters in a clean horizontal row.

* Allow wrapping if necessary, but avoid making the section too tall.

Mobile:

* Horizontal scrolling.

* Do not force the user to see all filters at once.

* Hide the scrollbar if appropriate while keeping scrolling functional.

Active filter

The selected category should have a visually distinct active state.

Use the existing QuickPack India brand colors where possible.

Do not hard-code the competitor's green color unless it already matches QuickPack India's branding.

---

6. FILTER BEHAVIOUR

The filters must actually work.

When the user clicks:

All

Show all products.

3 Ply Corrugated Boxes

Show only products belonging to the 3 Ply category.

5 Ply Corrugated Boxes

Show only products belonging to the 5 Ply category.

Die Cut & Folding Boxes

Show products assigned to this category.

Printed Packaging Boxes

Show printed packaging products.

Mailer Boxes

Show all relevant mailer box products.

Mono Carton Packaging

Show mono carton products.

Paper Bags

Show paper bag products.

Other Products

Show products such as:

* Thank You Card

* Premium Business Card

* Shredded Paper

* Round Paper Sticker

* Promotional Paper Pamphlet

Use the product data structure to assign categories rather than hard-coding UI-only filtering.

---

7. CATEGORY SECTION – CORRUGATED PACKING BOXES

The first major product section should be:

Corrugated Packing Boxes

Add a small category description:

Reliable corrugated packaging solutions designed for shipping, storage and product protection across different business requirements.

Then display the following products:

1. 3 Ply Corrugated Box

2. 5 Ply Corrugated Box

3. 7 Ply Corrugated Box

4. 9 Ply Corrugated Box

5. Corrugated Carton Box

6. Corrugated Packaging Box

7. Custom Corrugated Box

8. Heavy Duty Corrugated Box

9. Industrial 7 Ply Corrugated Box

10. Multi Layer Corrugated Box

11. Premium Imported Kraft Corrugated Boxes

12. Printed Corrugated Box

---

8. INITIAL PRODUCT CARD DISPLAY

For the Corrugated Packing Boxes section:

Initially display:

8 products

Layout:

Desktop

4 cards per row × 2 rows = 8 cards

Tablet

Responsive grid based on available width.

Mobile

1 or 2 cards per row depending on screen width.

After the initial 8 products, show a:

View More

button.

When clicked, reveal the remaining products.

The remaining products should appear naturally below the existing cards.

Do not reload the page.

The button can change to:

Show Less

after all products are displayed, allowing the user to collapse the additional products.

If there are only 8 or fewer products in a category, do not show the View More button.

---

9. PRODUCT CARD DESIGN

Every product must use the same reusable product-card component.

Each card should contain:

1. Product Image

Use the actual QuickPack India product image whenever available.

2. Product Name

Example:

3 Ply Corrugated Box

3. View More button

Example:

View More →

The entire card can optionally be clickable, but the View More button must clearly communicate that the user can open the product details.

Card design:

* Clean white/background surface

* Subtle border

* Rounded corners

* Consistent image aspect ratio

* Proper image containment

* Product name below image

* Clear CTA

* Subtle hover effect

* No excessive animation

Do not distort product images.

Use `object-fit: contain` or an equivalent approach where appropriate.

---

10. PRODUCT IMAGE DATA

Use the following competitor product list only as the initial product catalogue/reference for mapping the products.

Do NOT directly hotlink competitor images in the final QuickPack India website.

Where the existing QuickPack India codebase already contains the corresponding real product image, use that image.

If a corresponding real QuickPack India image does not yet exist, structure the product data so that the image can easily be added later.

Do not use random stock images.

---

11. CORRUGATED PRODUCT DATA

Create/use product data for:

3 Ply Corrugated Box

5 Ply Corrugated Box

7 Ply Corrugated Box

9 Ply Corrugated Box

Corrugated Carton Box

Corrugated Packaging Box

Custom Corrugated Box

Heavy Duty Corrugated Box

Industrial 7 Ply Corrugated Box

Multi Layer Corrugated Box

Premium Imported Kraft Corrugated Boxes

Printed Corrugated Box

Each product object should ideally contain:

```text

id

name

category

image

slug

description (if available)

size (if available)

```

Do not invent detailed specifications that are not available.

---

12. PAPER BAGS SECTION

After the Corrugated Packing Boxes section, create:

Paper Bags

Products:

1. Eco Friendly Paper Bag

2. Printed Paper Bag

Display them using the same reusable product-card component.

If there are only 2 products, display both without a View More button.

---

13. PREMIUM MAILER BOXES SECTION

Create:

Premium Mailer Boxes

Products:

1. Corrugated Mailer Box

2. Custom Mailer Box

3. Folding Mailer Box

4. Kraft Mailer Box

5. Luxury Packaging Mailer Box

Use the same card design.

For 5 products:

* Show the first 4 initially.

* Display the 5th after `View More`.

---

14. MONO CARTON PACKAGING BOXES

Create:

Mono Carton Packaging Boxes

Products:

1. Cosmetic Mono Carton Box

2. Earpod Mono Carton Packaging Box

3. Mono Carton Packaging Box

4. Printed Mono Carton Box

Use the same reusable product-card component.

---

15. OTHER PRODUCTS

Create a final category:

Other Products

Products:

1. Thank You Card

2. Premium Business Card

3. Shredded Paper

4. Round Paper Sticker

5. Promotional Paper Pamphlet

Again, use the same product-card component.

---

16. CATEGORY NAVIGATION

The top filter buttons should be connected to the product categories.

When a category is selected, there are two acceptable approaches:

Preferred behaviour

Filter the complete product catalogue and show matching products.

OR

If the page uses category sections:

Smooth-scroll to the relevant category section and visually activate the selected filter.

Choose whichever approach produces the cleaner UX.

The important requirement is that clicking a filter should immediately help the user find the relevant products.

---

17. PRODUCT DETAIL ROUTING

Every product's `View More` button should lead to a proper product detail page/route if the project already supports product detail routes.

Use a clean slug-based route structure such as:

`/products/3-ply-corrugated-box`

or reuse the existing project's established product-detail routing.

Do NOT create duplicate routing systems if one already exists.

If the existing application already has a product detail page, connect the new cards to that existing implementation.

---

18. PRODUCT DATA ARCHITECTURE

Do not hard-code every product directly inside JSX/HTML.

Create/use a centralized product data structure.

For example:

```text

products

 ├── corrugated-packing-boxes

 ├── premium-mailer-boxes

 ├── mono-carton-packaging

 ├── paper-bags

 └── other-products

```

This should make it easy for QuickPack India to add new products later without rebuilding the UI.

The UI components should consume this product data dynamically.

---

19. RESPONSIVE DESIGN

The entire page must be fully responsive.

Desktop

* 4 product cards per row where space allows.

* Comfortable section spacing.

* Large search bar.

* Horizontal category filters.

Tablet

* 2–3 cards per row depending on viewport width.

Mobile

* 1–2 cards per row.

* Search bar full width.

* Category filters horizontally scrollable.

* Product images properly sized.

* Product names should not overflow.

* Buttons must remain easily tappable.

* No horizontal page scrolling.

---

20. PERFORMANCE

Because this page may eventually contain many products:

* Use reusable components.

* Avoid unnecessary re-renders.

* Lazy-load product images where appropriate.

* Use optimized local assets.

* Do not load every large image unnecessarily.

* Maintain smooth filtering and searching.

---

21. SEO

The Products page should be SEO-friendly.

Suggested title:

Packaging Products | Corrugated Boxes, Mailer Boxes & Mono Cartons | QuickPack India

Suggested meta description:

Explore QuickPack India's range of corrugated boxes, mailer boxes, mono cartons, paper bags and custom packaging solutions.

Use:

* One H1.

* H2 for major product categories.

* Proper product headings.

* Descriptive image alt text.

* Clean product URLs/slugs.

* Semantic HTML.

---

22. FINAL CTA

After all product categories, add a CTA section:

Need Custom Packaging?

Tell us what you need and our team can help you find the right packaging solution for your business.

Buttons:

Get a Quote

Contact Us

Use the existing Contact/Enquiry functionality.

Do not create fake form submission logic.

---

23. VERY IMPORTANT – BRAND & LEGAL NAME

QuickPack India is the online brand/business identity.

The legal/GST business name is:

Krishna Traders

Where appropriate, the website should clearly communicate:

QuickPack India is the online brand/business identity of Krishna Traders.

Do not incorrectly replace the legal business name with QuickPack India in GST/legal information.

---

24. DO NOT COPY COMPETITOR WEBSITE

The competitor links and screenshots provided in this prompt are for:

* Product discovery

* Product naming reference

* Category structure reference

* General UX inspiration

Do NOT:

* Copy their HTML/CSS.

* Copy their exact page layout.

* Copy their branding.

* Directly hotlink their images.

* Copy their descriptions.

* Copy their metadata.

* Copy their website code.

The final page must be an original QuickPack India implementation.

---

25. FINAL TESTING

After implementation:

1. Run the application.

2. Open `/products`.

3. Verify search works.

4. Verify every filter works.

5. Verify product cards render correctly.

6. Verify View More/Show Less works.

7. Verify all product links work.

8. Verify images load correctly.

9. Verify mobile responsiveness.

10. Verify there are no console errors.

11. Verify there is no horizontal scrolling.

12. Verify the existing `/products` data/images have not been deleted or replaced.

13. Verify the existing header/footer still work.

14. Verify the final page uses real QuickPack India data wherever available.

The final result should feel like a professional B2B packaging catalogue for QuickPack India, with fast product discovery, useful search/filtering, clean product cards and scalable product data architecture.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bec419f8-3824-4dbe-8754-3de719fc6a38).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
