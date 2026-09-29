import type { auth } from "@@/server/auth";

import { apiKeyClient } from "@better-auth/api-key/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient({ plugins: [apiKeyClient(), inferAdditionalFields<typeof auth>()] });
