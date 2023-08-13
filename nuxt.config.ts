export default defineNuxtConfig({
  css: ["vuetify/lib/styles/main.sass", "@mdi/font/css/materialdesignicons.min.css"],
  build: {
    transpile: ["vuetify", "trpc-nuxt"],
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/styles/_variables.scss";',
        },
      },
    },
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    },
  },
  typescript: {
    shim: false,
  },
  imports: {
    dirs: ["composables/**"],
  },
  runtimeConfig: {
    public: {
      azureBlobUrl: process.env.AZURE_BLOB_URL,
      baseUrl: process.env.BASE_URL,
      facebookClientId: process.env.FACEBOOK_CLIENT_ID,
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
