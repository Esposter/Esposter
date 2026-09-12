import type { H3Event } from "h3";

// `trpc-nuxt` bundles its own copy of h3's H3Event declaration, which misses nitro's augmentations, so we
// Structurally accept only the members we read instead of h3's H3Event itself.
export type H3EventInput = Pick<H3Event, "headers" | "node">;
