import { app } from "./configuration/app";
import { pwa } from "./configuration/pwa";
import { RoutePath } from "./models/router/RoutePath";

export default defineNuxtConfig({
  alias: {
    // @TODO: https://github.com/Hebilicious/authjs-nuxt/issues/2
    cookie: "cookie",
  },
  build: {
    transpile: ["@vuepic/vue-datepicker", "trpc-nuxt"],
  },
  imports: {
    dirs: ["composables/**"],
  },
  nitro: {
    esbuild: {
      options: {
        // Required for top-level await for drizzle migrations
        target: "esnext",
      },
    },
  },
  routeRules: {
    [RoutePath.Dungeons]: { ssr: false },
  },
  typescript: {
    shim: false,
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @import "vuetify/settings";
          @import "@/assets/styles/variables.scss";
          `,
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
  runtimeConfig: {
    auth: {
      secret: process.env.AUTH_SECRET,
    },
    azure: {
      storageAccountConnectionString: process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING,
    },
    database: {
      url: process.env.DATABASE_URL,
    },
    facebook: {
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    public: {
      azure: {
        blobUrl: process.env.AZURE_BLOB_URL,
      },
      baseUrl: process.env.BASE_URL,
      facebook: {
        clientId: process.env.FACEBOOK_CLIENT_ID,
      },
    },
  },
  modules: [
    "@hebilicious/authjs-nuxt",
    "@nuxtjs/google-fonts",
    "@pinia/nuxt",
    "@unocss/nuxt",
    "@vite-pwa/nuxt",
    "@vueuse/nuxt",
    "vuetify-nuxt-module",
  ],
  authJs: {
    baseUrl: process.env.BASE_URL,
    guestRedirectTo: RoutePath.Login,
    authenticatedRedirectTo: RoutePath.Index,
  },
  googleFonts: {
    families: {
      Frijole: true,
      Montserrat: true,
    },
  },
  pwa,
  unocss: {
    attributify: true,
    theme: {
      fontFamily: {
        Montserrat: ["Montserrat"],
      },
    },
    rules: [["break-word", { "word-break": "break-word" }]],
  },
  app,
});
