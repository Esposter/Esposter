import { NuxtImgStub } from "#parity/NuxtImgStub";
import { config } from "vitest-browser-vue";

// NuxtImg is the image component the Nuxt app registers for every page, and the browser suites mount without the app, so
// every mount draws it as the plain image it renders
config.global.stubs = { ...config.global.stubs, NuxtImg: NuxtImgStub };
