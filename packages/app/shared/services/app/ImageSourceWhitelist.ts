// Relative imports, against the alias rule everywhere else: `configuration/security.ts` pulls this in from
// Nuxt.config, which is evaluated before the aliases exist. Rewriting them to `#shared/` breaks the build
import "../../types/env.d.ts";
import {
  BLOGSPOT_BASE_URL,
  GRAPESJS_BASE_URL,
  MAILJET_BASE_URL,
  PLACEHOLD_BASE_URL,
  TUI_BASE_URL,
  WORDPRESS_DESIGNSPELL_BASE_URL,
} from "../grapesjs/constants";

export const ImageSourceWhitelist = [
  // @vite-pwa/nuxt
  "'self'",
  // Phaser, surveyjs
  "data:",
  // Upload file createObjectURL preview
  "blob:",
  // Github user image
  "*.githubusercontent.com",
  // Google user image
  "*.googleusercontent.com",
  // Azure
  process.env.AZURE_CONTAINER_BASE_URL,
  // Grapesjs — the hosts its stock blocks and default templates load images from
  BLOGSPOT_BASE_URL,
  GRAPESJS_BASE_URL,
  MAILJET_BASE_URL,
  PLACEHOLD_BASE_URL,
  TUI_BASE_URL,
  WORDPRESS_DESIGNSPELL_BASE_URL,
];
