// The binding the page calls once Nuxt has finished hydrating, named so no app global can collide with it
export const HYDRATED_BINDING = "__hydrationCheckHydrated";
// A page that never finishes hydrating fails the check rather than holding the job
export const HYDRATION_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
// Vue reports a mismatch as "Hydration completed but contains mismatches." in a production build, and as a
// "Hydration … mismatch" warning per node in development
export const HYDRATION_MESSAGE_REGEX = /hydration/iu;
export const SITEMAP_LOCATION_REGEX = /<loc>(?<location>[^<]+)<\/loc>/gu;
