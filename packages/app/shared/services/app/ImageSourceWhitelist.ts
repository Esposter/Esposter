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
  // Emoji-mart-vue-fast
  "https://unpkg.com/emoji-datasource-apple@15.0.1/img/apple/sheets-256/64.png",
  // Azure
  process.env.AZURE_CONTAINER_BASE_URL,
  // Grapesjs
  BLOGSPOT_BASE_URL,
  // Grapesjs
  GRAPESJS_BASE_URL,
  // Grapesjs
  MAILJET_BASE_URL,
  // Grapesjs
  PLACEHOLD_BASE_URL,
  // Grapesjs
  TUI_BASE_URL,
  // Grapesjs
  WORDPRESS_DESIGNSPELL_BASE_URL,
];
