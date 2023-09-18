import path from "pathe";
import { RoutePath } from "./models/router/RoutePath";

export default defineNuxtConfig({
  alias: {
    // @TODO: https://github.com/Hebilicious/authjs-nuxt/issues/2
    cookie: path.resolve(__dirname, "node_modules/cookie"),
  },
  css: ["vuetify/lib/styles/main.sass", "@mdi/font/css/materialdesignicons.min.css"],
  build: {
    transpile: ["vuetify", "trpc-nuxt"],
  },
  nitro: {
    esbuild: {
      options: {
        // Used for top-level await for drizzle migrations
        target: "esnext",
      },
    },
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
  // @TODO: "@vueuse/sound/nuxt"
  modules: ["@hebilicious/authjs-nuxt", "@nuxtjs/google-fonts", "@pinia/nuxt", "@unocss/nuxt", "@vueuse/nuxt"],
  authJs: {
    baseUrl: process.env.BASE_URL,
    guestRedirectTo: RoutePath.Login,
    authenticatedRedirectTo: RoutePath.Index,
  },
  googleFonts: {
    families: {
      Montserrat: true,
    },
  },
  pinia: {
    autoImports: ["defineStore", "storeToRefs"],
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
