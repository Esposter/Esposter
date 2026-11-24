import type { NuxtConfig } from "nuxt/schema";

// The Content-Signal policy nuxt-ai-ready wrote into robots.txt by default, stated here now that its module is
// Off: search and AI input are allowed, and AI training is not stated
export const robots: NonNullable<NuxtConfig["robots"]> = {
  groups: [{ contentSignal: ["search=yes, ai-input=yes"], disallow: "", userAgent: "*" }],
};
