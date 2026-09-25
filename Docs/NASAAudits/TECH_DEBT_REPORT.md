# Technical Debt Audit & Pruning Plan

## 1. Identified Dependency Issues
- **UI Component Mismatches**: `src/components/ui/calendar.tsx` has properties not matching expected types, indicating potential `react-day-picker` or Shadcn configuration drift.
- **Storage/Blob API Mismatches**: `src/components/photo-gallery.tsx` and `src/components/storage-manager.tsx` show incompatibility between `Uint8Array` and `BlobPart`, suggesting outdated `sharp` or DOM library typing.
- **Implicit `any` Types**: Multiple files across `src/app` and `src/components` rely on implicit `any`, violating JPL Rule 7.

## 2. Remediation Strategy
- **Phase 1 (Immediate)**: Synchronize `package.json` versions and perform a clean `npm install`.
- **Phase 2 (Targeted)**: Refactor identified files (`photo-gallery.tsx`, `storage-manager.tsx`, `calendar.tsx`) to align with latest type definitions.
- **Phase 3 (Audit)**: Replace implicit `any` with explicit domain types from `/src/lib/types.ts`.

## 3. Metric Benchmarks
- Current Build Errors: 14+
- Current Lint Warnings: 1
- Target: 0 Errors, 0 Warnings
