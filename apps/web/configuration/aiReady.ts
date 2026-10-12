import type { NuxtConfig } from "nuxt/schema";

// @nuxtjs/seo installs nuxt-ai-ready since v6; off until serving every page as Markdown and llms.txt is a decision
export const aiReady: NuxtConfig["aiReady"] = false;
