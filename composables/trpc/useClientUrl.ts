import { TRPC_CLIENT_PATH } from "@/services/trpc/constants";

export const useClientUrl = () => {
  const runtimeConfig = useRuntimeConfig();
  return `${runtimeConfig.public.baseUrl}${TRPC_CLIENT_PATH}`;
};
