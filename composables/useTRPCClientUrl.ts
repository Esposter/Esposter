import { TRPC_CLIENT_PATH } from "@/util/constants.client";

export const useTRPCClientUrl = () => {
  const config = useRuntimeConfig();
  return `${config.public.baseUrl}${TRPC_CLIENT_PATH}`;
};
