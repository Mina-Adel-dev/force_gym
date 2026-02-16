# Force Gym Static Website

A premium static website for Force Gym, a real gym in Egypt. Built with pure HTML, CSS, and JavaScript (no frameworks). Fully responsive, accessible, and bilingual (EN/AR).

## How to Run Locally

### Option 1: VS Code Live Server
1. Open the project folder in VS Code.
2. Install the "Live Server" extension.
3. Right-click on `index.html` and select "Open with Live Server".

### Option 2: Python HTTP Server
1. Open terminal in the project root.
2. Run `python -m http.server 8000` (or `python3`).
3. Visit `http://localhost:8000` in your browser.

## Editing Content
All text content is stored in JSON files inside the `data/` folder:
- `site.en.json` – English content
- `site.ar.json` – Arabic content

Edit these files to update text, phone numbers, social links, etc. The website will reflect changes after refresh.

## Flags
The JSON files contain a `flags` object that can be used to conditionally show/hide sections (e.g., `showHours`, `showTestimonials`). By default all are `false`.

## Assets
- Logo: place your logo at `assets/images/logo.jpg`
- Promo video: place your video at `assets/video/force-video.mp4`

If the video is missing, the hero will show a CSS gradient fallback (already implemented via the `hero-fallback` div).

## Language Switching
- The language toggle in the navbar switches between English and Arabic.
- The chosen language is saved in `localStorage` and persists across pages.
- Arabic mode sets `dir="rtl"` on the `<html>` element and uses a suitable font.

## Schedule Page
The schedule page reads from `data/schedule.json`. If the file is empty (as provided), it shows "Schedule coming soon". To add a schedule, populate the JSON with an array of objects containing `day`, `class`, and `time` fields.

## Contact Form
The contact form validates:
- Name (required, min 2 chars)
- Phone (required, Egyptian mobile pattern)
- Goal (optional)

On submit, it shows a success toast and logs the data to console (no backend).

## Notes
- No opening hours are displayed (conflicting sources).
- All information is based on verified facts provided.
- The site uses modern CSS features like `clamp()`, `backdrop-filter`, and CSS variables for maintainability.

## License
© Force Gym