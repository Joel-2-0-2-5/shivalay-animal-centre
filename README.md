# Shivalay Animal Wellness Centre: website and animal registry

A static website (plain HTML, CSS and JavaScript) for Shivalay Animal Wellness Centre, a unit of House of Stray Animals, Noida. Built as a college Service Learning Project. It needs no server or build step and runs on GitHub Pages.

**Information is compiled by student volunteers. Unconfirmed details (phone, email, hours, fees) are marked TODO in `config.js`.** All animals shown by default are fictional sample data.

## Files
| File | Purpose |
|---|---|
| `index.html` | The single page that every route loads |
| `css/styles.css` | Styles, including dark mode |
| `js/app.js` | Routing, data loading and all pages |
| `config.js` | All settings and links. Edit this first |
| `data/sample-data.js` | Fictional sample animals (fallback data) |
| `animals-template.csv` | Import into Google Sheets to create the registry |
| `qr-tags.html` | Printable A4 sheet of QR collar tags |
| `404.html` | Sends broken addresses back to the home page |
| `SETUP.md` | Step-by-step setup for students |
| `STAFF_GUIDE.md` | One-page guide for centre staff |

## Routes
`#/` home, `#/animals`, `#/animal/SH-0001`, `#/adopt`, `#/report`, `#/services`, `#/get-involved`, `#/about`, `#/staff`.

## Quick start
Follow `SETUP.md`. To preview locally, run `python -m http.server` in this folder and open http://localhost:8000.

## QR tags
Each tag opens `{SITE_BASE_URL}/#/animal/{animal_id}`. Ear notching remains the standard marker for sterilised community dogs; the QR tag complements it. Collars can be lost, so profiles do not rely on the tag alone.
