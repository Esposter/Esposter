import { TRPC_CLIENT_PATH } from "@/util/constants.common";

export const useTRPCClientUrl = () => {
  const siteDomain = useSiteDomain();
  return `${siteDomain}${TRPC_CLIENT_PATH}`;
};
