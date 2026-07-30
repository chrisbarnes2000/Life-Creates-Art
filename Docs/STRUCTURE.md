# Project Structure

## Overview
MiniBarnMaster is a professional shed design and customization platform built for the Pacific Northwest climate. It leverages Next.js, Firebase, and AI (Genkit/Gemini) to provide interactive designs and weather-resilient recommendations.

## Core Directories
- `/src/app`: Next.js App Router pages and API routes.
- `/src/components`: UI components, including the Shed Designer and Weather Assistant.
- `/src/firebase`: Firebase configuration, providers, and custom hooks for Firestore.
- `/src/ai`: AI logic using Genkit, including custom flows and prompts.
- `/src/lib`: Shared types, utility functions, and demo data.
- `/Docs`: Project maintenance, roadmaps, and architectural strategy documentation.

## Key Components
- **Shed Designer** (`/src/components/shed-designer.tsx`): The main interactive customization tool.
- **Expert Climate Guide** (`/src/components/weather-assistant.tsx`): Expert-led recommendations component focused on PNW climate resilience.
- **Gallery Manager** (`/src/app/admin/components/GalleryTab.tsx`): Advanced asset management with collapsible sections, Google Photos sync, and material infrastructure tracking.
- **Firebase Integration**: Robust real-time sync with Firestore for designs and consultations.

## Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database/Auth**: Firebase (Firestore, Auth)
- **AI**: Google Genkit + Gemini
- **Animations**: Framer Motion
