import { nodeResolve } from "@rollup/plugin-node-resolve";
import type { Plugin } from "nuxt/dist/app/nuxt";

export default defineNuxtConfig({
  css: [
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.min.css",
    "emoji-mart-vue-fast/css/emoji-mart.css",
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/styles/_variables.scss";',
        },
      },
    },
    build: {
      // Set build targets to esnext to allow top-level awaits in ts files
      target: "esnext",
      rollupOptions: {
        // @NOTE: https://github.com/vitejs/vite/issues/7385
        plugins: [nodeResolve() as Plugin],
      },
    },
  },
  nitro: {
    esbuild: {
      options: {
        target: "esnext",
      },
    },
  },
  build: {
    transpile: ["vuetify"],
  },
  modules: ["@nuxtjs/google-fonts", "@unocss/nuxt", "@pinia/nuxt", "@vueuse/nuxt"],
  typescript: {
    shim: false,
    tsConfig: {
      compilerOptions: {
        // @NOTE: https://github.com/unjs/nitro/issues/273
        // typescript-json-deserializer
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
      },
    },
  },
  googleFonts: {
    families: {
      Montserrat: true,
    },
  },
  unocss: {
    attributify: true,
    theme: {
      fontFamily: {
        Montserrat: ["Montserrat"],
      },
    },
    rules: [["break-word", { "word-break": "break-word" }]],
  },
  runtimeConfig: {
    public: {
      azureBlobUrl: process.env.AZURE_BLOB_URL,
      baseUrl: process.env.BASE_URL,
      facebookClientId: process.env.FACEBOOK_CLIENT_ID,
      nodeEnv: process.env.NODE_ENV,
      wsBaseUrl: process.env.WS_BASE_URL,
      wsPort: process.env.WS_PORT,
    },
  },
  experimental: {
    reactivityTransform: true,
  },
});
