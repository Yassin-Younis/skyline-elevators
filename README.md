# SKYLINE Elevators · website redesign (demo)

Static redesign of the SKYLINE Elevators (Riyadh, KSA) website, rebuilt from the original site package.
Pure HTML/CSS/JS, no build step. Bilingual: English (default) and Arabic with full RTL layout. Brand navy `#424969` and red `#CE181E` from the original logo.

Live demo: https://yassin-younis.github.io/skyline-elevators/

Sections: hero, about, elevator types (tabs + lightbox), styles & accessories, cabin gallery (filters), 360° Kuula tours, maintenance, clients, downloads (PDFs), FAQ, contact.

## Internationalization

- Every visible string carries a `data-i18n` / `data-i18n-html` / `data-i18n-attr` key; `i18n/en.json` is the reference dictionary (generated from the markup) and `i18n/ar.js` holds the Arabic translations as `window.SKYLINE_I18N.ar`.
- `main.js` captures the English strings from the DOM at load, then swaps them in place on toggle (header/drawer button), sets `<html lang dir>`, swaps the Arabic logo, rebuilds JS-generated captions, and persists the choice (`?lang=ar` or localStorage).
- RTL layout comes from logical CSS properties plus a `[dir="rtl"]` block (Cairo + Tajawal fonts, mirrored arrows, LTR-isolated numbers).
- To add a language: create `i18n/<code>.js` with the same keys, include it before `main.js`, and add the code to the toggle logic (and to `RTL` if right-to-left).
