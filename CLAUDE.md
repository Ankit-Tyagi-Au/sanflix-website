# Sanflix website (sanflix.in)

Plain HTML/CSS/JS site for Sanflix, a Kedar Consumer Products brand. Hosted on Netlify (drag-and-drop deploy). Redesigned Sept 2026. The owner is non-technical: explain in plain English and check desktop + phone before calling anything done.

## Confirmed business facts (use exactly; don't invent others)
- Company: Kedar Consumer Products
- Registered address: 196/25, Near Old Court, Shivaji Nagar, Narnaul, Haryana 123001
- Grievance Officer: Priyanka Kumari (info@sanflix.in)
- Courts / jurisdiction: Narnaul
- Enquiry data retention: 1 year
- WhatsApp: +91 81688 00195 · Email: info@sanflix.in
- Products (catalogue, 6): Dishwash, Toilet Cleaner, Floor Cleaner (purple, lavender), Glass Cleaner, Soft Wash (liquid hand wash), White Phenyl
- Pack sizes shown on site: 500 ml, 1 L, 5 L (from the owner's brief; the Soft Wash photo shows 250 ml, so confirm with the client)
- Claims: safe wording only. No "10X", "99.9%", or unproven dealer promises (margins, marketing support, demand).

## Must keep
- Google Analytics 4 tag `G-ZH7ZVCZYS8` in every page `<head>`
- Existing page URLs: index, about, products, faq, contact, privacy, terms (.html). New: retailers.html, 404.html
- Enquiry form posts to Formspree (`https://formspree.io/f/xoeqpdew`), submitted with fetch in script.js
- Both the chatbot (Sanflix Assistant) and the WhatsApp buttons

## How it works
- `style.css`: all styling. Tokens in `:root`. Each product has a colour world class (`.w-dishwash`, `.w-toilet`, `.w-floor`, `.w-glass`, `.w-softwash`, `.w-phenyl`) that sets `--bg/--deep/--accent/--ink`.
- `script.js`: language switch, mobile menu, home hero rotation (`PRODUCTS` list), wipe-clean canvas, reveal-on-scroll, enquiry form, chatbot (`CHAT` keyword list, answers in EN + HI).
- **Bilingual text**: every piece of text is written twice, `<span class="t-en">…</span><span class="t-hi" lang="hi">…</span>`. `html[data-lang="hi"]` shows the Hindi one. The choice is saved in localStorage (`sanflix-lang`) and applied by a tiny inline script in `<head>` before the page paints. Placeholders use `data-hi-placeholder`. Legal pages are English only.
- Header, footer, floating buttons, mobile bottom bar and chat panel are repeated in every HTML file. Change them in all pages.
- Enquiry links can pre-fill the form: `contact.html?product=Dishwash` or `?type=retailer`.
- GA events sent: `generate_lead` (form sent), `wipe_clean_complete`.
- Cache-busting: CSS/JS are linked as `style.css?v=2` / `script.js?v=2`. Bump the number after changing them.

## Files
- `assets/bottles/*.webp`: transparent cut-out bottles (made from the product photos; floor.webp is cut from the catalogue and is low-res, so replace it when a proper photo arrives)
- `assets/og-image.jpg`: share preview for WhatsApp/Facebook
- `assets/products/*`: old photos, kept so old links still work
- `design-directions/`: the three hero options shown to the client (B chosen, plus C's wipe as a section). Not uploaded.
- `sitemap.xml`, `robots.txt`

## Preview locally
`python3 -m http.server 5173 --bind 127.0.0.1` from this folder, then open http://127.0.0.1:5173

## Deploy
Upload folder = everything except `.git`, `.claude`, `design-directions`, `CLAUDE.md`:
`rsync -a --exclude .git --exclude .claude --exclude .DS_Store --exclude design-directions --exclude CLAUDE.md ./ ~/Desktop/sanflix-upload/`
Then drag `sanflix-upload` onto the site's Deploys page in Netlify.
