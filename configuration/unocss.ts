import type { NuxtConfig } from "nuxt/schema";

export const unocss: NuxtConfig["unocss"] = {
  attributify: true,
  theme: {
    fontFamily: {
      Montserrat: ["Montserrat"],
    },
  },
  rules: [["break-word", { "word-break": "break-word" }]],
};
