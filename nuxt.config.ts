export default defineNuxtConfig({
  routeRules: {
    "/clicker/**": { ssr: false },
  },
  css: [
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.min.css",
    "emoji-mart-vue-fast/css/emoji-mart.css",
  ],
  build: {
    transpile: ["vuetify"],
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/styles/_variables.scss";',
        },
      },
    },
  },
  typescript: {
    shim: false,
    tsConfig: {
      compilerOptions: {
        // @NOTE: https://github.com/unjs/nitro/issues/273
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
      },
      typeRoots: ["types"],
    },
  },
  imports: {
    dirs: ["composables/**"],
  },
  runtimeConfig: {
    public: {
      azureBlobUrl: process.env.AZURE_BLOB_URL,
      baseUrl: process.env.BASE_URL,
      facebookClientId: process.env.FACEBOOK_CLIENT_ID,
      nodeEnv: process.env.NODE_ENV,
    },
  },
  // @NOTE: "@vueuse/sound/nuxt"
  modules: ["@nuxtjs/google-fonts", "@pinia/nuxt", "@sidebase/nuxt-auth", "@unocss/nuxt", "@vueuse/nuxt"],
  googleFonts: {
    families: {
      Montserrat: true,
    },
  },
  pinia: {
    autoImports: ["defineStore", "storeToRefs"],
  },
  auth: {
    origin: process.env.BASE_URL,
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
});
