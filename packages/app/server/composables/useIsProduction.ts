import { Environment } from "#shared/models/environment/Environment";
import { useRuntimeConfig } from "nuxt/app";

export const useIsProduction = () => {
  const runtimeConfig = useRuntimeConfig();
  return runtimeConfig.public.appEnv === Environment.production;
};
