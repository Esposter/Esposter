import { addressRateLimiter } from "#server/services/rateLimiter/addressRateLimiter";
import { RATE_LIMITER_BYPASS_LOG_MESSAGE } from "#server/services/rateLimiter/constants";
import { IS_PRODUCTION } from "#shared/util/environment/constants";

// The one place an anonymous route spends its address budget and its bypass is written, so no route can enforce the
// Budget or skip it differently. Outside production nothing is spent, and an address that cannot be determined is let
// Through with a warning, as the tRPC middleware lets one through. A spent budget rejects with the limiter's own
// Rejection, which a caller reads with `checkIsRateLimitExceeded`
export const consumeAddressRateLimit = async (address: string): Promise<void> => {
  if (!IS_PRODUCTION) return;
  if (!address) {
    console.warn(RATE_LIMITER_BYPASS_LOG_MESSAGE);
    return;
  }

  await addressRateLimiter.consume(address);
};
