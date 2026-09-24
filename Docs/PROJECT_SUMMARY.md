# LifeCreatesArt — Project Summary

**Platform Name:** LifeCreatesArt  
**Current Version:** `v0.2.5`  
**Artist & Brand:** Tina Croft Barnes  
**Core Mission:** A fine art portfolio, gallery management, and client showcase platform built with Next.js 15, Firebase, Google Genkit/Gemini AI, and Tailwind CSS.

---

## 1. Executive Summary

**LifeCreatesArt** is an art exhibition, gallery management, and custom consultation web application. Designed specifically for artist Tina Barnes, the platform combines a public showcase with an enterprise-grade admin control center.

The application allows prospective art collectors, design clients, and exhibition visitors to explore curated albums, inspect artwork details with protective watermarks, and request bespoke consultations. On the backend, it provides Tina with asset management tools, self-healing database synchronization, client-side image compression, and direct metadata management.

---

## 2. Technology Stack & Infrastructure

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 15 (App Router)** & **React 19** | Server-side rendering, API routing, and high-performance interactive UI. |
| **Styling & UI Components** | **Tailwind CSS**, **shadcn/ui**, **Radix UI** | Modern design, accessible primitives, and customized styling. |
| **Motion & Icons** | **Framer Motion**, **Lucide React** | Fluid transitions, hover effects, and UI iconography. |
| **Database & Auth** | **Firebase Firestore** & **Firebase Auth** | Real-time NoSQL cloud database and administrative authentication. |
| **Storage & Media** | **Google Cloud Storage (Firebase Storage)** | Scalable storage for high-resolution photography and digital art assets. |
| **Media Processing** | **`heic2any`** & **HTML5 Canvas Compressor** | Client-side Apple HEIC-to-JPEG conversion and automated file compression. |
| **AI Workflows** | **Google Genkit** & **Gemini 3.5 Flash** | Server-side AI flows for design assistance and creative descriptions. |

---

## 3. Core Architectural Pillars & Features

### A. Public Fine Art Gallery (`/src/components/photo-gallery.tsx`)
- **Album & Sub-Album Filtering:** Visitors can explore works categorized by albums (e.g., *Interior*, *Exterior*, *Framing*, *Custom Art*) and drill into sub-albums.
- **Dynamic Sorting Engine:** Sort photos on the fly by **Upload Date** (Newest/Oldest) or **Last Modified Date** (Recent/Older).
- **Artwork Details:** High-resolution preview cards display title, album badge, dimensions, medium, pricing, and upload/modification timestamps.
- **Intellectual Property Protection:**
  - **Dynamic Watermark Overlay:** Configurable watermark text (defaulting to `© Tina Barnes`) rendered across both Google Photos and direct Firestore uploads.
  - **Context-Menu Shield:** Native right-click and image-save actions are intercepted with informative guidance to request high-res licensing.

### B. Enterprise Admin Control Panel (`/src/app/admin/`)
- **Modular Dashboard Architecture:** Divided into domain-specific modules (`SettingsTab`, `GalleryTab`, `InquiriesTab`, `TestimonialsTab`) maintaining clean separation of concerns (<150 lines in `page.tsx`).
- **Cloud Storage Explorer (`/src/components/storage-manager.tsx`):**
  - Interactive bucket tree navigation and directory structure browsing.
  - Granular file metadata assignment (album tags, sub-albums, custom pricing).
  - Bulk actions: Move to directory, archive selected, or bulk purge assets.
  - **Self-Healing Integrity Repair (`prune`):** Automatically scans Firestore and GCS, removes orphaned 404 entries, and seamlessly adopts untracked files into the active database.
  - **System Reconciliation (`archive-untracked`):** Moves legacy or untracked assets cleanly into `/archive` without manual file operations.
- **Non-Blocking UI Safeguards:**
  - All native browser blocking dialogs (`window.confirm`) are replaced with Radix UI `AlertDialog` modals to ensure zero freezing within sandboxed iframe previews.

### C. Resilient Ingestion & Upload Pipeline
- **Automatic Apple HEIC/HEIF Conversion:** Converts `.heic` and `.heif` camera captures directly to standard `.jpg` files in the browser using lazy-loaded `heic2any`, preventing broken previews.
- **Client-Side Canvas Compression:** Images exceeding 1MB are automatically scaled down to a maximum width of 1920px at 82% quality to prevent payload limits and optimize network transmission.
- **Fault-Tolerant Batching:** Multi-file uploads execute in isolated error boundaries; a failure on a single file does not interrupt the rest of the batch.
- **Persistent Token Generation:** Server-side upload handlers generate permanent, unguessable `firebaseStorageDownloadTokens` UUIDs on GCS, ensuring all generated preview links remain permanent.
- **Streaming Image Proxy (`/api/storage/preview`):** Proxies authenticated media streams on-the-fly for untracked assets and internal administrative previews.

### D. Client Inquiries & Consultations
- **Bespoke Consultation Requests:** Online submission forms for custom framing, photography inquiries, and art commissions.
- **Interactive Material & Design Guides:** Informational modules displaying materials, custom wood framing options, and geometric design guidelines.
- **Admin Inquiries Management:** Real-time inquiry reviews with status tracking (e.g., *Pending*, *In Review*, *Quoted*, *Completed*).

---

## 4. Data Models & Schema Overview

### Firestore Collections
1. **`gallery`**:
   - `id`: Unique record identifier (UUID / Firestore Document ID)
   - `title`: Artwork title or caption
   - `url`: Tokenized public Google Cloud Storage download URL
   - `storagePath`: Relative storage path (e.g., `gallery/autumn-landscape.jpg`)
   - `album`: Primary collection category
   - `subAlbum`: Secondary classification (optional)
   - `medium`: Art medium (e.g., Fine Art Print, Canvas, Wood Frame)
   - `dimensions`: Artwork dimensions (e.g., `24" x 36"`)
   - `price`: Pricing in USD (optional)
   - `createdAt` / `updatedAt`: Firestore timestamps
2. **`consultations`**:
   - Client contact details, project scope, preferred materials, dimensions, and workflow status.
3. **`testimonials`**:
   - Verified client reviews, ratings, and display statuses.
4. **`settings`**:
   - Site-wide configuration, including `watermarkEnabled` boolean and `watermarkText` string.

### Storage Directory Structure
```text
gs://[project-bucket]/
├── gallery/           # Active, published gallery photographs & artwork
├── archive/           # Reconciled or archived past works
│   └── trash/         # Staged deletions and purged records
└── thumbnails/        # Generated compressed thumbnails
```

---

## 5. Development & Operational Commands

```bash
# Start local development server (Port 3000)
npm run dev

# Run application linter
npm run lint

# Compile production build
npm run build

# Start Google Genkit development environment
npm run genkit:dev
```

---

## 6. Project Roadmap & Future Enhancements

- **Customer Portal (`/Docs/RoadMaps/CUSTOMER_PORTAL.md`):** Transitioning one-time client consultations into persistent user accounts with saved artwork favorites and live order tracking.
- **Partner Print Shop Integration:** Direct order routing and dynamic pricing with fine-art print partners (e.g., CVS, Walmart, Costco photo fulfillment) once commercial API contracts are finalized.
