# Coral & Cord — Website

Website for Coral & Cord, premium Australian fishing and outdoor apparel inspired by the Great Barrier Reef.

## Live site (GitHub Pages)

Enable under **Settings → Pages → Deploy from a branch → `main` / root**.
`.nojekyll` is included so all asset folders serve correctly.

## What's real vs placeholder

- **Hero banner**: real supplied photography (`assets/hero.jpg`)
- **Product images**: real product renders across 8 collections (Ribbon Reef, Bluewater, Tropic Tide, Sunset Current, Coral Garden, Reef Topography, Mangrove Roots, Electric Reef) — cropped from supplied product sheets. Full set (shirt front/back, hoodie, shorts, buff per collection) lives in `assets/` for future product pages.
- **Category cards / pattern tiles / story image**: concept crops from the approved design comp — replace with final photography when ready.

## Pages

- `index.html` — home (hero banner layout, categories, carousel, story, patterns, Reef Collection, newsletter)
- `collections.html` — shop grid: category + collection filters, sort, pagination (32 products)
- `product.html?id=<id>` — product detail: gallery, sizes, tabs, related products (works for all 32 ids)

## Features

- Sticky nav: transparent over hero, frosted after scroll; working mobile hamburger menu on all pages
- Ribbon Reef product carousel (12 products, hover front/back swap, arrows + dots)
- **Working cart**: add to cart, slide-out drawer, quantity steppers, remove, line totals, subtotal, free-shipping progress bar ($150 AUD threshold), persists via localStorage (memory fallback), Esc/overlay close; shared across all pages via `assets/cart.js` (size variants supported)
- Checkout button is a placeholder — wire to Shopify/Stripe/commerce platform when ready
- Self-hosted subset fonts (Cormorant Garamond + Manrope, ~88KB, SIL OFL) — no CDN dependency
- Responsive, reduced-motion aware, keyboard accessible

## Brand tokens (`:root` in index.html)

Navy `#0F2B46` · Deep Ocean `#123F56` · Reef Blue `#2E7D8D` · Tropical Aqua `#65C9D6`
Soft Sand `#E8DCC7` · Coral `#E86F51` · Seafoam `#C7D8D5` · Warm off-white `#F4EFEA`
