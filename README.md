# Qualiseed Ltd — Landing Page

A premium, conversion-focused landing page for Qualiseed Ltd, a certified seed company serving farmers across Ghana.

## Structure

```
index.html            Single-page site (hero, why-us, products, how-it-works,
                       testimonials, agro-dealers, final CTA, footer)
assets/css/style.css   All styling (CSS custom properties for brand colors/fonts)
assets/js/script.js    Mobile nav, sticky header shadow, scroll-reveal animation
```

No build step or framework — plain HTML/CSS/JS. Open `index.html` directly or serve
the folder with any static file server (e.g. `python3 -m http.server`).

## Primary conversion paths

- Header, hero, final CTA, and a floating action button all link to
  `wa.me/233208373586` (WhatsApp) with a pre-filled message, and to
  `tel:0208373586`.
- Product cards deep-link into WhatsApp with a message pre-filled for that
  specific seed category, so an enquiry arrives already qualified.

## Before this goes live — please action

1. **Logo** — the header currently uses a text wordmark + a simple seed-drop
   icon placeholder, not the official Qualiseed logo. Swap in the real logo
   file (do not let anyone regenerate/redraw it) in `index.html` (`.logo`)
   and update `assets/img/`.
2. **Testimonials** — the testimonials section (`#testimonials` in
   `index.html`) currently holds placeholder copy, clearly marked with an
   HTML comment. Replace with real, permission-granted farmer/agro-dealer
   quotes before publishing — do not ship invented quotes as genuine.
3. **Product photography** — product cards currently use brand-color gradient
   tiles instead of real photos (maize, rice, soybean, vegetables). Swap in
   real product/packaging photography when available for a stronger,
   premium result.
4. **Seed catalog copy** — category descriptions are intentionally generic
   (no specific variety names) since current availability wasn't confirmed.
   Update with actual variety names/specs once confirmed.
5. **Contact details** — verify phone (`020 837 3586` / WhatsApp
   `233208373586`), Instagram handle (`@qualiseedltd`), and
   `www.qualiseed.com` links are current.

## Deploying

Any static host works (Vercel, Netlify, GitHub Pages, cPanel, etc.) — just
upload the three files/folders above. No environment variables or server
required.
