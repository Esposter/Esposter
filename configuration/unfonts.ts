import type { NuxtConfig } from "nuxt/schema";
import { FontKey } from "../models/dungeons/keys/FontKey";

export const unfonts: NuxtConfig["unfonts"] = {
  google: {
    families: ["Montserrat"],
  },
  custom: {
    families: {
      [FontKey["Kenney-Future-Narrow"]]: `./assets/dungeons/kenneysAssets/fonts/${FontKey["Kenney-Future-Narrow"]}.ttf`,
    },
  },
};
