import { CLOUDFLARE_ACCOUNT_ID } from "@esposter/db-schema";

// The policy resources of a token scoped to the whole account, which reaches every resource the account holds
export const getAccountWideResources = (): Record<string, string> => ({
  [`com.cloudflare.api.account.${CLOUDFLARE_ACCOUNT_ID}`]: "*",
});
