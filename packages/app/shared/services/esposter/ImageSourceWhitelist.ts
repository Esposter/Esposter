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
  // phaser, surveyjs
  "data:",
  // Upload file createObjectURL preview
  "blob:",
  // Github user image
  "*.githubusercontent.com",
  // Google user image
  "*.googleusercontent.com",
  // emoji-mart-vue-fast
  "https://unpkg.com/emoji-datasource-apple@15.0.1/img/apple/sheets-256/64.png",
  // Azure
  process.env.AZURE_BLOB_URL,
  // grapesjs
  BLOGSPOT_BASE_URL,
  // grapesjs
  GRAPESJS_BASE_URL,
  // grapesjs
  MAILJET_BASE_URL,
  // grapesjs
  PLACEHOLD_BASE_URL,
  // grapesjs
  TUI_BASE_URL,
  // grapesjs
  WORDPRESS_DESIGNSPELL_BASE_URL,
];
