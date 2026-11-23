// The app manifest Nuxt reads: each build's `builds/meta/<build id>.json`, and `builds/latest.json`, which the outdated-build
// Check reads for the id of the newest build
const APP_MANIFEST_PATHNAME_REGEX = /^\/_nuxt\/builds\/(?:meta\/[^/]+\.json|latest\.json)$/u;

export const checkAppManifestUrl = (url: URL, origin: string): boolean =>
  url.origin === origin && APP_MANIFEST_PATHNAME_REGEX.test(url.pathname);
