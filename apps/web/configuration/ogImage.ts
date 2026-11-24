import type { NuxtConfig } from "nuxt/schema";

// Off: no page defines an image (`defineOgImage`), no route rule names one and no component sits under `OgImage/`,
// So it would render nothing, yet it would still copy its Inter fonts into `public` and mount the routes serving them
export const ogImage: NonNullable<NuxtConfig["ogImage"]> = { enabled: false };
