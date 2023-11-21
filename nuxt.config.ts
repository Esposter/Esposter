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
    optimizeDeps: {
      // From VueUse
      exclude: ["vue-demi"],
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
  unocss: {
    attributify: true,
    theme: {
      fontFamily: {
        Montserrat: ["Montserrat"],
      },
    },
    rules: [["break-word", { "word-break": "break-word" }]],
  },
  app: {
    head: {
      link: [
        {
          rel: "canonical",
          href: process.env.BASE_URL,
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/icons/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/icons/favicon-16x16.png",
        },
        {
          rel: "manifest",
          href: "/manifest.json",
        },
        {
          rel: "mask-icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
        {
          rel: "shortcut icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
        {
          rel: "apple-touch-icon",
          type: "image/png",
          href: "/icons/apple-icon-180.png",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-2048-2732.jpg",
          media:
            "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-2732-2048.jpg",
          media:
            "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-1668-2388.jpg",
          media:
            "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-2388-1668.jpg",
          media:
            "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-1536-2048.jpg",
          media:
            "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-2048-1536.jpg",
          media:
            "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-1668-2224.jpg",
          media:
            "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-2224-1668.jpg",
          media:
            "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-1620-2160.jpg",
          media:
            "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-2160-1620.jpg",
          media:
            "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-1284-2778.jpg",
          media:
            "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-2778-1284.jpg",
          media:
            "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-1170-2532.jpg",
          media:
            "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-2532-1170.jpg",
          media:
            "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-1125-2436.jpg",
          media:
            "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-2436-1125.jpg",
          media:
            "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-1242-2688.jpg",
          media:
            "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-2688-1242.jpg",
          media:
            "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-828-1792.jpg",
          media:
            "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-1792-828.jpg",
          media:
            "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-1242-2208.jpg",
          media:
            "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-2208-1242.jpg",
          media:
            "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-750-1334.jpg",
          media:
            "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-1334-750.jpg",
          media:
            "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-640-1136.jpg",
          media:
            "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/apple-splash-1136-640.jpg",
          media:
            "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
        },
      ],
      htmlAttrs: { lang: "en" },
    },
  },
});
