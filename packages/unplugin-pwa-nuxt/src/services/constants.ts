// The folder under the build assets where Nuxt writes each build's app manifest
export const BUILD_META_DIRECTORY = "builds/meta";

// The file types the precache lists: the app's code and styles, and the images and fonts its bundle and public folder serve,
// So an installed app draws them offline. A file a game engine loads is kept out by the app's `globIgnores`, since the
// Engine asks for it by its own URL
export const PRECACHE_EXTENSIONS = ["avif", "css", "html", "jpeg", "jpg", "js", "png", "svg", "webp", "woff2"];
