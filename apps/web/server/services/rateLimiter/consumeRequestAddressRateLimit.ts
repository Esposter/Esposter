import type { RequestEvent } from "nuxt/server";

import { consumeAddressRateLimit } from "#server/services/rateLimiter/consumeAddressRateLimit";
import { getIpAddress } from "#server/services/request/getIpAddress";
import { getRequestIP } from "nuxt/server";

// The address a route that answers before it knows its caller spends first: the one key a caller cannot choose. Every
// Such route calls this before it reads anything else of the request, so none can spend the address differently
export const consumeRequestAddressRateLimit = (event: RequestEvent): Promise<boolean> =>
  consumeAddressRateLimit(getIpAddress(event.req.headers, getRequestIP(event) ?? ""));
