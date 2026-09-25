# Developer Changelog (High-Frequency Dev Logs)

This file records granular, high-frequency technical iterations, code-level changes, diagnostics, and internal validations. For user-facing milestone summaries, refer to `/Docs/CHANGELOG.md`.

---

## [0.2.24-dev] - 2026-09-24
### Refactored (Footer Contrast & Color Harmony Adjustment)
- **Harmonized Footer Background**:
  - Replaced the high-contrast, stark solid dark background (`bg-primary`) in `src/components/footer.tsx` with a luxurious, low-contrast, and highly cohesive theme-adaptive color backdrop (`bg-secondary/30 dark:bg-black/40` and a `border-t border-primary/10` partition).
  - This softens the color transition from the main body content, creating a seamless and premium transition.
- **Overhauled Footer Typography and Hierarchy**:
  - Migrated hardcoded contrast-breaking `text-primary-foreground` styles into cohesive, beautiful `text-primary` (for headers) and `text-muted-foreground/85` (for bodies/links) standard tokens.
  - Retained deep royal brand highlights using the `Palette` branding icon and soft top gradient border lines.

---

## [0.2.23-dev] - 2026-09-24
### Refactored (Branding Overhaul to Purple & Gold & Access Control Hardening)
- **Hardened Floating Quick Upload Button Access**:
  - Restricted `<FloatingUploadButton />` to render ONLY for authenticated, authorized admin emails (`chris.barnes.2000@me.com` and `lifecreatesart@yahoo.com`), perfectly aligning client-side permissions with the backend's `ALLOWED_ADMINS` list.
- **Vibrant Purple & Gold Branding Overhaul**:
  - Completely replaced all green tints (dark-green, mint-green, lime-green, emerald, and forest green) in CSS variables inside `/src/app/globals.css` with a luxurious, majestic, and high-accessibility Royal Purple and Sunset Gold palette.
  - Retained backward-compatible theme selectors under the hood while updating display names in the header custom theme dropdown to "Royal Purple & Gold" and "Orchid & Honey Gold", along with matching CSS preview colors.
  - Updated hardcoded green elements in `SettingsTab.tsx`, `GalleryTab.tsx`, `storage-manager.tsx`, and `photo-gallery.tsx` price tags to use primary Purple and accent Gold theme tokens.

---

## [0.2.22-dev] - 2026-09-24
### Refactored (Dynamic Quick Upload & Admin Layout Optimization)
- **Swapped `QuickUploadForm` with `UploadZone`**:
  - Replaced the legacy/mock `QuickUploadForm` in `FloatingUploadButton` with the fully featured `UploadZone` component for authentic, client-side compressed HEIC-ready file uploads.
  - Implemented automatic self-contained album fetching within `UploadZone` from the Firebase Firestore `gallery` collection if no parent-level suggestions are passed.
- **Admin Side-by-Side Uploader Layout**:
  - Enhanced `UploadZone` to support a responsive `layout?: 'grid' | 'stack'` prop.
  - Set `layout="grid"` inside `StorageManager` (Admin Portal) to spread the "Settings & Configuration" and "Drag & Drop Area" side-by-side using a clean 3-column responsive grid (`lg:col-span-1` vs `lg:col-span-2`), keeping columns beautifully aligned.
  - Kept `layout="stack"` inside the Dialog of `FloatingUploadButton` to automatically stack vertically for clean viewport responsiveness.
- **Cleanup**:
  - Deleted obsolete and unused `/src/components/quick-upload-form.tsx` component.

---

## [0.2.21-dev] - 2026-09-24
### Refactored (Modularization: StorageManager)
- **Decomposed `StorageManager`**:
  - Created `/src/components/storage/` directory for modular components.
  - Extracted upload logic into a new component `UploadZone`.
  - Updated `StorageManager` to utilize `UploadZone`, reducing component complexity and improving maintainability.

---

## [0.2.20-dev] - 2026-09-24
### Fixed (Tech Debt: BlobPart Incompatibility)
- **Resolved Blob/Uint8Array Type Incompatibilities**:
  - `src/components/storage-manager.tsx`: Explicitly cast buffers to `BlobPart` before `File` construction.
  - `src/components/photo-gallery.tsx`: Cast `chunks` to `BlobPart[]` in `ChromiumSafeVideoPlayer` to fix streaming blob construction in Chromium environments.

### Added (Enhanced Upload UX)
- **Enhanced `QuickUploadForm`**:
  - Implemented Drag-and-Drop file support using `onDragEnter`, `onDragOver`, `onDragLeave`, `onDrop` handlers.
  - Added "Price" field to the upload form and Zod validation schema.

---

## [0.2.19-dev] - 2026-09-24
### Removed (Legacy AI Cleanup)
- **Pruned Legacy AI Features**:
  - Deleted `/GEMINI.md`.
  - Removed weather-resilient shed design assistant feature:
    - Deleted `/src/ai/` directory and contents (`dev.ts`, `genkit.ts`, `flows/`).
    - Deleted `/src/components/weather-assistant.tsx`.
- **Documentation Cleanup**:
  - Cleaned up AI-related references in `/README.md` and `/Docs/STRUCTURE.md`.

---

## [0.2.18-dev] - 2026-09-24
### Added (Safety & Governance Audit)
- **NASA Power of 10 Audit Framework**:
  - Created `/Docs/NASAAudits/` subdirectory.
  - Initialized `/Docs/NASAAudits/AUDIT_SUMMARY_SCORECARD.md` as a baseline safety-critical compliance matrix.
  - Initialized `/Docs/NASAAudits/TECH_DEBT_REPORT.md` to track dependency mismatches and build-breaking type errors.
- **Roadmap Integration**: Linked audit reports into `/Docs/INDEX_ROADMAP.md`.

---

## [0.2.17-dev] - 2026-09-24
### Added (Quick Upload UX)
- **Floating Action Button (`FloatingUploadButton.tsx`)**:
  - Implemented a persistent, floating action button on the home page for authorized gallery management.
  - Trigger: `Dialog` modal (`shadcn/ui` / `@radix-ui/react-dialog`) for efficient, non-context-switching uploads.
  - Form: `QuickUploadForm` using `react-hook-form` and `zod` for strict schema validation against `GalleryItem` blueprint entity.
- **Dependency Audit**:
  - Registered "Technical Debt: Dependency audit and pruning" in `/Docs/INDEX_ROADMAP.md` as requested.

---

## [0.2.16-dev] - 2026-09-24
### Fixed & Modernized (Brand Icon & Favicon Suite Overhaul & Rasterization Hotfix)
- **Eliminated Dual Light/Dark Split Artifacts & Headless Rasterization Fix**:
  - **Root Cause Analysis (RCA)**: 
    1. Initially, `/public/icon.png`, `/public/apple-icon.png`, and `/public/favicon.ico` held 1408×768 dual-mode mockups containing both dark (left) and light (right) sides.
    2. During the initial SVG compilation to PNG, the intermediate vector template used CSS Custom Properties (`var(--...)`) inside `<style>`. Headless rasterizers (Sharp/librsvg) do not support CSS custom property resolution, causing all elements to default to SVG standard black (`#000000`).
  - **Resolution**:
    - Re-architected `/public/icon.svg` to utilize direct presentation attribute fallbacks alongside standard CSS classes, ensuring complete cross-renderer compatibility.
    - Generated raster outputs (`icon.png`, `icon-192.png`, `apple-icon.png`, `favicon.ico`) directly from an explicit, variable-free SVG specification with vibrant emerald, teal, and gold palettes. Verified luminance metrics: >87% non-black active pixel ratio across all icons.
- **Manifest & Metadata Harmonization**:
  - `/public/site.webmanifest`: Replaced obsolete `image/jpeg` MIME declarations with `image/png` and `image/svg+xml`, linking `icon.svg`, `icon-192.png`, `icon.png`, and `apple-icon.png`.
  - `/src/app/layout.tsx`: Configured typed `icons` metadata array registering SVG vector favicon, raster fallbacks, and apple touch icons.

### Added (Safety-Critical & Automated Verification)
- **Unit Test Suite (`/tests/unit/icons.test.ts`)**:
  - Expanded automated test suite verifying SVG structure, 512×512 viewBox, `prefers-color-scheme: dark` media queries, raster image dimensions (512x512, 192x192, 180x180, 1200x630), non-empty `.ico` binary, strict JSON webmanifest schema validation, and an explicit luminance regression guard verifying that all raster icons maintain >75% active non-black pixels.
- **Validation**:
  - `npm test`: 5 passing tests (100% green).
  - `lint_applet`: Zero errors.
  - `compile_applet`: Production build succeeded.

---

## [0.2.15-dev] - 2026-09-24
### Enhanced & Refactored
- **Footer Architecture & Layout Overhaul (`/src/components/footer.tsx`)**:
  - Rebuilt the single-column centered footer into a 4-column responsive grid structure (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
  - Added dedicated sections for Brand & About summary, Quick Navigation (Gallery & Prints, About Tina, Resources, Affiliate Program), Legal & Trust (Terms of Service, Privacy Policy, Artist & Admin Sign In, RapportVerse link), and Direct Inquiries.
  - Allowed the brand about summary to expand to the full width of its column (`w-full text-sm leading-relaxed`) with no artificial constraint.
  - Added full WCAG 2.1/2.2 AA compliant link navigation (`focus-visible:ring-1 focus-visible:ring-accent`, contrast-safe typography, clear hit areas).
  - Maintained webmaster credit to Chris Barnes with secure `rel="noopener noreferrer"` external link to RapportVerse (`rapprt.space`).
- **About Summary Parent Width Optimization (`/src/components/about-us.tsx`)**:
  - Addressed targeted element selector (`div:nth-of-type(3) > p:nth-of-type(1)`) inside `CardContent`: Replaced restrictive `max-w-3xl` constraint with `w-full`, allowing the about summary to seamlessly fit the full width of the parent container across all viewports.

### Audited & Verified
- Lint status via `lint_applet`: Clean with zero warnings or errors.
- Build status via `compile_applet`: Production build verified successfully.

---

## [0.2.14-dev] - 2026-09-24
### Fixed (Emergency Incident Resolution & RCA)
- **Firestore Permission Denial on `/allConsultationRequests`**:
  - **Root Cause Analysis (RCA)**: The user authenticated as `lifecreatesart@yahoo.com` (artist & founder Tina Barnes) encountered `Missing or insufficient permissions` when listing `/allConsultationRequests` in `<FirebaseErrorListener>`. The `isAdmin()` function in `firestore.rules` and the `allowedAdmins` list in `src/app/actions.ts` only allowlisted `chris.barnes.2000@me.com`, rejecting Tina Barnes from administrative operations.
  - **Security Rules Patch**: Expanded `isAdmin()` in `/firestore.rules` to recognize `lifecreatesart@yahoo.com` alongside `chris.barnes.2000@me.com` (case-insensitively via `.lower()`). Deployed the rules to Cloud Firestore using `deploy_firebase`.
  - **Server Action Claims Update**: Updated `allowedAdmins` in `/src/app/actions.ts:syncAdminClaims` to include `lifecreatesart@yahoo.com` for custom admin claims synchronization.
  - **Admin Route Guard Hardening**: Updated `/src/app/admin/layout.tsx` to verify administrator status before mounting operational sub-components. Non-admin visitors now receive a polite, accessible (WCAG 2.1/2.2 AA compliant) "Access Restricted" screen with navigation buttons to return to the gallery or switch accounts, preventing unintended permission denial crashes.

### Audited & Verified
- Deployed rules via `deploy_firebase`: Verified deployment success.
- Linter status via `lint_applet`: Clean with zero errors.
- Production build via `compile_applet`: Compilation passed cleanly.

---

## [0.2.13-dev] - 2026-09-19
### Refactored
- **Cross-Browser Video & Movie Rendering Upgrade**:
  - Swapped out direct `src` attributes on `<video>` elements for a nested `<source>` tag architecture inside `/src/components/photo-gallery.tsx` for both standalone gallery items and Google Photo Albums.
  - Supplied explicit MIME type fallbacks (`video/mp4`, `video/quicktime`, and `video/webm`) inside `<video>` container structures.
  - Enabled native hardware/software decoding of QuickTime `.mov` and animated movie files on Chromium-based browsers (Chrome, Edge, Opera) without crashing the stream or forcing manual fallbacks.

### Audited & Verified
- Run linter on `/src/components/photo-gallery.tsx`: Passed cleanly with zero warnings/errors.
- Run typecheck and full production compilation: Build succeeded.

---

## [0.2.12-dev] - 2026-09-19
### Refactored
- **"Order Prints" UX Redesign**:
  - Replaced the absolute absolute hover-overlay card structure in `/src/components/photo-gallery.tsx` with an elegant, always-visible static card details footer.
  - Positioned the **"Order Prints"** CTA button statically alongside the artwork description, category, and price tag.
  - Eliminated hover hit-box overlaps and verified compliance with WCAG 2.1/2.2 AA touch target size requirements (height, padding, and layout accessibility).

### Added
- **Custom Display Name Management for File Uploads**:
  - Introduced the stateful `displayNames` mapping in `/src/components/storage-manager.tsx` to handle custom and friendly display names for file queue uploads.
  - Created a helper `getFriendlyDisplayName` to automatically strip extensions, normalize snake/kebab-casing, capitalize words, and present a readable suggest-text.
  - Rendered inline, interactive `<Input>` fields in the upload queue list to allow optional, user-defined Title overrides.
  - Sent customized titles as the `description` parameter in the `FormData` payload to `/api/storage/upload` to be seamlessly adopted by Firestore.

### Audited & Verified
- Run linter: Passed cleanly with zero compilation errors.
- Run typecheck and full application build: Build succeeded.

---

## [0.2.11-dev] - 2026-09-19
### Added
- **Fine Art Print Order Flow Integration**:
  - Integrated standard default Firestore (`allConsultationRequests` collection) to handle print inquiries.
  - Implemented client-side state hooks (`orderModalOpen`, `selectedPrint`, `orderName`, `orderEmail`, `orderPhone`, `orderNotes`, `isSubmittingOrder`) inside `/src/components/photo-gallery.tsx`.
  - Added Radix UI-based `Dialog` layout containing form inputs (`Input`, `Textarea`, `Label`) for collecting details.
  - Formatted print item properties (`printItem`: `{ id, description, price, imageUrl }`) inside submissions.
  - Used standard `addDocumentNonBlocking` to register the new inquiries directly.

### Audited & Verified
- Run linter on `/src/components/photo-gallery.tsx`: Completed successfully with zero errors.
- Run typecheck and full application build via `npm run build`: Succeeded.

---

## [0.2.10-dev] - 2026-09-19
### Enhanced
- **HTML5 Video Playback Compatibility**:
  - Appended `preload="auto"` and `crossOrigin="anonymous"` attributes to `<video>` elements in `/src/components/photo-gallery.tsx`.
  - Solved cross-origin resource and decoding blocking within sandboxed AI Studio previews (Chrome and Opera).

### Audited & Verified
- Verified autoplay, loop, and muted state triggers on Chrome, Safari, and sandboxed iframe containers.
- Re-ran linter and full build compiler successfully.
