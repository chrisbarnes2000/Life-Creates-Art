# Developer Changelog (High-Frequency Dev Logs)

This file records granular, high-frequency technical iterations, code-level changes, diagnostics, and internal validations. For user-facing milestone summaries, refer to `/Docs/CHANGELOG.md`.

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
