# Project Structure

## Overview
LifeCreatesArt is a professional fine art portfolio, gallery management, and creative showcase platform for Tina Barnes. It leverages Next.js, Firebase, and AI to provide interactive photo galleries, secure consultation management, and dynamic art showcases.

## Core Directories
- `/src/app`: Next.js App Router pages and API routes.
- `/src/components`: UI components, including the Photo Gallery, Testimonials, About Us, and the `FloatingUploadButton` with the modular `UploadZone` for quick gallery management.
- `/src/firebase`: Firebase configuration, providers, and custom hooks for Firestore.
- `/src/lib`: Shared types, utility functions, and demo data.
- `/public`: Static web assets, theme-adaptive vector favicon (`icon.svg`), PWA manifests, and multi-resolution brand icons (`icon.png`, `icon-192.png`, `apple-icon.png`, `favicon.ico`, `opengraph-image.png`).
- `/tests`: Automated unit tests verifying brand invariants, asset resolutions, and schema validation.
- `/Docs`: Project maintenance, roadmaps, audits, and architectural strategy documentation.
  - `/Docs/CHANGELOG_DEV.md`: High-frequency developer log capturing granular code-level updates.
  - `/Docs/CHANGELOG.md`: Customer-facing milestone release notes.
  - `/Docs/Audits/`: System security, accessibility, and architectural audit reports.

## Key Components
- **Photo Gallery** (`/src/components/photo-gallery.tsx`): Interactive fine art photo and album viewer with lightbox and watermark overlay.
- **Admin Control Panel** (`/src/app/admin/`): Enterprise management for gallery items, site settings, and customer inquiries. (Note: The Upload Center has been removed as direct image uploading is non-functional; metadata management is handled via the System Explorer).

## Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database/Auth**: Firebase (Firestore, Auth, Storage)
- **Animations**: Framer Motion
