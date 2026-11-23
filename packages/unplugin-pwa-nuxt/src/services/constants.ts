// The file types the precache lists: the app's code and styles, and the images and fonts its bundle and public folder serve,
// So an installed app draws them offline. A file a game engine loads is kept out by the app's `globIgnores`, since the
// Engine asks for it by its own URL
export const PRECACHE_EXTENSIONS: string[] = [
  "avif",
  "css",
  "html",
  "jpeg",
  "jpg",
  "js",
  "png",
  "svg",
  "webp",
  "woff2",
];
