## RICE Score Calculator (Nuxt 3 + DaisyUI)

This project provides a single‑page web UI to calculate and compare RICE scores (Reach, Impact, Confidence, Effort) for product features. You can add multiple features, sort them by RICE score automatically, and export the result table as a PNG image.

### What is RICE?
RICE is a prioritization framework to objectively rank ideas/features based on the following variables:

- Reach: Number or percentage of users impacted in a given time period
- Impact: Degree of benefit to the user (typical scale 0.25–3)
- Confidence: How confident you are in your estimates (0–100%)
- Effort: Work required to deliver (person‑days, sprints, etc.)

Formula:

```
RICE = (Reach × Impact × (Confidence/100)) / Effort
```

Higher score means higher priority.

### When to Use
- To rank many backlog ideas using consistent, objective criteria
- To maximize impact with constrained resources
- To bring a shared reference into team decision‑making

### Project Features
- Multiple feature input and automatic sorting (descending RICE score)
- Clean UI with DaisyUI
- Validation: Effort > 0, Confidence 0–100, Impact/Reach cannot be negative
- Export the results table to a high‑DPI PNG
- During export: “Delete” action column is hidden and light theme is applied

### Setup and Run
1) Install dependencies:

```bash
npm install
```

2) Start the dev server:

```bash
npm run dev
```

3) Open in the browser:

```
http://localhost:3000
```

### How to Use
1) In “Add New Feature”, enter name, description, and metrics (Confidence as %).
2) Click “Add”; features are automatically sorted by RICE score.
3) In “Comparison Table”, click “Export PNG” to download the table as an image.
4) “Clear All” removes all features. “Load Examples” adds sample data.

Notes:
- PNG export uses a white background and temporarily switches to the light theme.
- The “Delete” column is not included in the exported PNG.

### Tech Stack
- Nuxt 3 (Vue 3)
- TailwindCSS + DaisyUI
- html-to-image (PNG export)

### Folders / Files
- `pages/index.vue`: Main page with form, table, calculation, and export
- `nuxt.config.ts`: Global configuration and Tailwind integration
- `tailwind.config.cjs`: Tailwind + DaisyUI settings
- `assets/css/tailwind.css`: Tailwind entry

### Ideas for Improvements
- i18n (TR/EN toggle)
- Persistence (LocalStorage) and CSV/JSON export
- Additional visualizations (mini charts, radar chart)

### License
This project is provided as an example; feel free to use it as a base in your personal or commercial projects.


