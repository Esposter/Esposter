import type { NuxtConfig } from "nuxt/schema";

// Off: the app serves none of its llms.txt, markdown pages or the Link headers that point at them, and its build
// Warns on every build without a public site url. The one default crawlers read, the Content-Signal line of robots.txt,
// Is stated in `robots.ts` instead
export const aiReady: NonNullable<NuxtConfig["aiReady"]> = { enabled: false };
