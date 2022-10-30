import { Environment } from "@/util/environment";

export const useIsProd = () => {
  const config = useRuntimeConfig();
  return config.public.nodeEnv === Environment.production;
};
