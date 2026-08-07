# Project Structure

## Overview
LifeCreatesArt is a professional fine art portfolio, gallery management, and creative showcase platform for Tina Barnes. It leverages Next.js, Firebase, and AI to provide interactive photo galleries, secure consultation management, and dynamic art showcases.

## Core Directories
- `/src/app`: Next.js App Router pages and API routes.
- `/src/components`: UI components, including the Photo Gallery, Testimonials, and About Us.
- `/src/firebase`: Firebase configuration, providers, and custom hooks for Firestore.
- `/src/lib`: Shared types, utility functions, and demo data.
- `/Docs`: Project maintenance, roadmaps, and architectural strategy documentation.

## Key Components
- **Photo Gallery** (`/src/components/photo-gallery.tsx`): Interactive fine art photo and album viewer with lightbox and watermark overlay.
- **Admin Control Panel** (`/src/app/admin/`): Enterprise management for gallery items, site settings, and customer inquiries. (Note: The Upload Center has been removed as direct image uploading is non-functional; metadata management is handled via the System Explorer).

## Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database/Auth**: Firebase (Firestore, Auth, Storage)
- **AI**: Google Genkit + Gemini
- **Animations**: Framer Motion
