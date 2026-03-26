# Coding Standards

1. **Framework Strictness:**
   - Use Next.js App Router conventions. All components handling SDK hooks must declare `'use client'` at the top.
   - Server routes (`route.ts`) must export isolated HTTP verb functions (e.g., `export async function POST`).

2. **TypeScript Best Practices:**
   - Maintain explicit types, but when dealing with rapidly evolving AI SDK types (that conflict across major versions), prioritize functional flow. Utilizing `// @ts-nocheck` in experimental API routes is acceptable if the semantic streaming protocol works flawlessly.

3. **Styling Requirements:**
   - Use `clsx` and Vanilla Tailwind UI combinations.
   - Focus on sleek, rounded aesthetics (e.g., `rounded-xl`, `rounded-2xl`) and shadow layers for depth.
