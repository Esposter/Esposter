import { createEnv } from "@t3-oss/env-nuxt";
import { z } from "zod";
import { Environment } from "./models/shared/Environment";

export const env = createEnv({
  shared: {
    FACEBOOK_CLIENT_ID: z.string().min(1),
    NODE_ENV: z.nativeEnum(Environment),
  },
});
