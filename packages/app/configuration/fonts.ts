import type { NuxtConfig } from "nuxt/schema";

import { FontKey } from "../models/dungeons/keys/FontKey";

export const fonts: NuxtConfig["fonts"] = {
  families: [
    {
      name: FontKey.KenneyFutureNarrow,
      provider: "local",
    },
  ],
};
