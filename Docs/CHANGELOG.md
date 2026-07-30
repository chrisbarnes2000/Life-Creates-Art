# Changelog

All notable changes to this project will be documented in this file.

## [0.1.15] - 2026-07-16
### Changed
- **Removed and Updated Core Site Infrastructure Section**:
    - Replaced the old structural shed building asset manager (Gable Roofs, Siding, etc.) in the admin's `GalleryTab` with a clean, photography-focused **Brand & Site Media Elements** section to manage key static branding variables (`site-logo`, `profile-portrait`, and `home-accent`).
    - Standardized description copy in the admin tab to reflect photography and fine art portfolio management instead of construction metadata.
- **Refactored default Hero Carousel placeholders & metadata**:
    - Updated the default credit placeholders to reflect "Art and Photography by Tina Croft Barnes" and the new art series titles across both `src/app/page.tsx` and the admin `AssetsTab.tsx`.
    - Modified global metadata in `src/app/layout.tsx` to align the page title and SEO description with **LifeCreatesArt**.
    - Cleared residual old-branding texts in user reviews empty state messages and feedback forms.

## [0.1.14] - 2026-07-16
### Fixed
- **Consolidated Static Library Files**:
    - Merged `placeholder-images.json` and `demo-data.json` into a single, unified TypeScript/ES Module file (`src/lib/placeholder-images.ts`).
    - Resolved complaints by exporting an empty testimonials list `[]` by default, ensuring the testimonial carousel renders gracefully if no custom items are loaded.
    - Restored structural image placeholders such as `geometric-dome`, roof style variants, and material guides to guarantee layout integrity.
- **Removed Hardcoded Google Photos Fallbacks**:
    - Eliminated hardcoded fallback albums in both `src/components/photo-gallery.tsx` and the admin `GalleryTab` component.
    - Ensured that if Google Photos integrations are deleted or unset, they default cleanly to an empty state without persistently displaying the three pre-seeded albums from the previous project.

## [0.1.13] - 2026-07-16
### Fixed
- **Optimized Fallback Gallery Centering & Silent Load**:
    - Centered the local fallback project gallery collections and standalone photos perfectly across all responsive viewports using flexible wrap-based alignments (`flex-wrap justify-center`).
    - Suppressed the temporary "Loading project photos..." spinner overlay when the client relies on locally imported fallback gallery data, ensuring an instantaneous, flicker-free presentation even when Cloud Storage features are not active on the Spark plan.

## [0.1.12] - 2026-07-16
### Fixed
- **Robust Google Photos Empty State Configuration**:
    - Enhanced the "Update Integration" workflow in `src/app/admin/page.tsx` to automatically filter out empty/blank text items when saving Google Photos configurations.
    - Updated `src/components/photo-gallery.tsx` to omit empty album cards and dynamically hide the Google Photos Albums header section entirely if there are no albums configured or if the integration is completely removed.

## [0.1.11] - 2026-07-16
### Removed
- **Removed Obsolete Pricing Configuration Options**:
    - Completely removed the "Classic Shed Pricing" and "Geometric Dome Pricing" cards from the Admin Settings tab.
    - Consolidated the dynamic watermark toggle and watermark text config into a streamlined "Gallery & Watermark Settings" panel.
    - Added clean visual copy noting that print pricing config is disabled until a print shop partnership (CVS, Walmart, Costco, etc.) is established.

## [0.1.10] - 2026-07-16
### Fixed
- **Resilient Storage API Operations**:
    - Added try-catch guards around all GCP Storage bucket interactions on the server-side (`/api/storage/` & `/api/storage/list/`) to handle sandbox-unreachable or missing bucket instances, allowing database updates to proceed gracefully.
- **Graceful Google Photos Status Warning**:
    - Replaced high-severity console errors with descriptive console warnings when fetches to user-supplied or outdated Google Photos shared albums return non-ok statuses (e.g., private or expired albums).
- **Silent GCP API Check Fallback**:
    - Handled Google Cloud's disabled Identity Toolkit API exception gracefully in `syncAdminClaims`, logging an informative warning instead of throwing a massive error stack trace.

## [0.1.9] - 2026-07-15
### Changed
- **LifeCreatesArt Complete Brand Pivot**:
    - Redesigned the entire copy-text, branding, and hero section to focus on Tina Barnes (single mother of five, survivor of abuse, and artistic resilience).
    - Transitioned the core platform focus from "MiniBarnMaster" custom sheds and geodesic domes to fine art prints, photography collections, legacy albums, and private listings.
    - Updated the header, footer, resources, and affiliate program to match the new fine art branding.
- **Removed Deprecated Building/Shed Modules**:
    - Completely removed the "Shed Customizer", "Weather Assistant", and "Material Guide" panels to focus entirely on the gallery and print order flows.
    - Removed the competitors/comparison page completely from the site.
- **Watermark Engine Integration**:
    - Added support for admin-controlled gallery watermarks.
    - Integrates with the custom-configured watermark overlay within the lightbox and photo detail slides of the photo gallery.
- **Admin SDK Lazy-Initialization**:
    - Implemented proxy-based lazy loading of the Firebase Admin SDK to eliminate compile-time initialization exceptions during Next.js production builds.

## [0.1.8] - 2026-06-01
### Added
- **Single Inquiry Management Capabilities**:
    - Introduced a secure "Delete Inquiry" action button built with Radix AlertDialog on each card in the Operations list.
    - Added a powerful "Merge Inquiry Details" flow with interactive targets dropdown and combined notes support.
- **Visual Design Enhancements**:
    - Restructured client-facing inquiry list items to feature high-contrast forest-green accents, real-time date tags, and clear typography groupings including interactive icon representations (Mail, Phone, Calendar, User).
### Fixed
- **Admin Permission Denied Errors**:
    - Resolved "Missing or insufficient permissions" when deleting or merging inquiries by fixing CEL evaluation crashes in `firestore.rules`.
    - Removed unsupported `.lower()` string method call in security rules and replaced it with clean specific casing check.
    - Robustified the `isAdmin` helper block to prevent Map access exceptions on non-existing keys (like `admin` or `email`) for anonymous/recently created users.

## [0.1.7] - 2026-06-01
### Added
- **Admin Reset Tools**:
    - Implemented a "Clear All Inquiries" function in the Operations tab to allow quick resetting of lead data.
- **Improved Feedback**:
    - Integrated toast notifications in the `StatusEditor` to provide immediate visual confirmation of inquiry status changes.
### Fixed
- **Inquiry Persistence & Adjustability**:
    - Relaxed validation constraints in `firestore.rules` to allow partial updates (merging) during status transitions.
    - Verified `ManualRequestForm`, `ShedCustomizer`, and `GeometricDomes` all utilize robust field sets including `customerId` and `requestDate` to satisfy security policies.
    - Standardized update logic across Testimonials and Inquiries for consistent behavior.

## [0.1.6] - 2026-06-01
### Fixed
- **Firestore Permission Resilience**:
    - Transitioned `updateDocumentNonBlocking` to use `setDoc(..., { merge: true })` (upsert behavior) to resolve "Document not found" and persistent permission errors across both global and user-specific collections.
    - Updated `isAdmin` security check in `firestore.rules` to be case-insensitive for admin emails.
    - Fixed `ManualRequestForm` to include mandatory `customerId` and `auth` context to comply with hardened security rules.
- **Security Hardening**:
    - Implemented "Fortress" security rules with `isValidConsultationRequest` and `isValidTestimonial` validation helpers.
    - Secured `allConsultationRequests` collection by restricting list and update access to authenticated owners or admins.
    - Enforced strict document ownership checks for all user-specific data paths.

## [0.1.4] - 2026-06-01
### Refactored
- **Admin Settings Optimization**: 
    - Removed redundant **Display & Visual Identity** settings from the admin panel to consolidate configuration.
    - Integrated **Pricing Save** functionality directly into the pricing configuration cards for a more streamlined workflow: you can now save pricing updates directly from the shed and dome pricing sections.

## [0.1.3] - 2026-06-01
### Added
- **Customizer Enhancements**:
    - Implemented **Anonymous Inquiry Tracking**: Requesting an instant quote now logs a baseline configuration to Firestore, which is updated to a full submission if contact details are provided.
    - Redesigned the **Quote CTA**: Replaced basic toggles with a more engaging "Request Instant Quote" engine that emphasizes consultative value.
    - Set **Clear Polycarbonate** as the default covering option for Geometric Domes.
- **Infrastructure**:
    - Optimized `apphosting.yaml` with enhanced runtime configurations for improved performance and stability.

## [0.1.2] - 2026-05-31
### Added
- **Gallery Management UI**: 
    - Implemented collapsible sections for **Google Photos Integration**, **Main Project Archive**, and **Core Site Infrastructure Assets** to improve dashboard readability.
    - Added a dedicated **Materials Archive** list in the Core Infrastructure Assets section supporting T-11, Plywood, and Trim asset management.

## [0.1.1] - 2026-05-31
### Refactored
- **Expert Climate Guide**: Transitioned the "Weather-Resilient Design Assistant" from an AI-powered flow to a rule-based expert guide focused on Washington State and Pierce County specific knowledge.
- Removed AI branding and replaced it with "Expert Building Specifications" and localized structural advice (e.g., hurricane strapping, snow loads, and moss prevention).

### Fixed
- **Gallery Pagination UX**: Fixed an issue where pagination in the `PhotoGallery` scrolled the user to the top of the browser page. It now correctly scrolls into view of the gallery header for a smoother experience.
- Verified rule-based logic for climate recommendations in `actions.ts`.
### Added
- **SAM (Storage Asset Manager) Enhancements**: 
    - **Sync Reconciliation**: Added "Prune Orphans" tool to automatically clean up database references to missing storage files.
    - **Asset Adoption**: Introduced an "Adopt" button to instantly track existing storage files in the live project gallery.
    - **Grouped Filesystem View**: Assets are now automatically categorized into album folders (e.g., `Barn`, `Modern`) matching the site's project structure for significantly better organization.
    - **Automated Metadata Sync**: Renaming or moving files in storage now automatically updates the corresponding Firestore document paths and album categories.
    - **Session Persistence**: Implemented session-level caching for Cloud Storage listings to eliminate redundant network overhead when navigating the admin panel.
    - **Manage & Edit Performance**: Added pagination (Load More) to the Gallery Management grid to support high-volume photo archives.
    - Added direct Cloud Storage ID display (`gs://`) for better asset tracking.
    - Integrated direct Cloud Console deep-links for manual file inspection.
    - Implemented a "Quick Trash" feature for immediate permanent deletion of storage assets.
    - **Refined Pathing**: Move suggestions now automatically map to the `gallery/` structure.
- Initial project structure for MiniBarnMaster.
- Core shed customization and weather assistant components.
- Established `/Docs/` management strategy and agent instructions.
- Added Roadmap and Audit templates for future development.
- Configured Firebase integration with Firestore and Auth.
- Created **[Customer Portal](./RoadMaps/CUSTOMER_PORTAL.md)** Roadmap.
- Created **[Admin Dashboard Modularization](./Audits/ADMIN_DASHBOARD_MODULARIZATION.md)** Audit.

### Fixed
- Unified documentation casing by merging `/docs` into `/Docs`.
- Reduced header `z-index` from 50 to 40 to improve layering and prevent clipping over main sections.
- Refined homepage content alignment by adjusting negative margins and fixing `z-index` so hero text doesn't overlap cards.
- Scaled down large font sizes (`text-5xl`+) across the application on mobile views for better responsiveness.
- **Refactored** the Admin Dashboard by splitting out tabs into `InquiriesTab`, `AssetsTab`, `GalleryTab`, `TestimonialsTab`, and `SettingsTab`, reducing `admin/page.tsx` length from 800+ lines to ~160 lines.
