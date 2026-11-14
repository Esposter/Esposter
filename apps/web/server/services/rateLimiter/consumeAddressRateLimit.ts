import { RATE_LIMITER_BYPASS_LOG_MESSAGE } from "#server/services/rateLimiter/constants";
import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { env } from "cloudflare:workers";

// The one place an anonymous route spends its address budget and its bypass is written, so no route can enforce the budget
// Or skip it differently. Outside production nothing is spent, and an address that cannot be determined is let through with a
// Warning, as the tRPC middleware lets one through. Resolves to whether the request may proceed
export const consumeAddressRateLimit = async (address: string): Promise<boolean> => {
  if (!IS_PRODUCTION) return true;
  if (!address) {
    console.warn(RATE_LIMITER_BYPASS_LOG_MESSAGE);
    return true;
  }

  const { success } = await env.RATE_LIMITER_ADDRESS.limit({ key: address });
  return success;
};
