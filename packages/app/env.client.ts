import { createEnv } from "@t3-oss/env-nuxt";
import { z } from "zod";

export const env = createEnv({
  client: {
    NUXT_PUBLIC_AZURE_BLOB_URL: z.string().url(),
    NUXT_PUBLIC_BASE_URL: z.string().url(),
  },
});
