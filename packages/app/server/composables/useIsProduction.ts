import { Environment } from "#shared/models/environment/Environment";
import { useRuntimeConfig } from "nitropack/runtime";

export const useIsProduction = () => {
  const runtimeConfig = useRuntimeConfig();
  return runtimeConfig.public.appEnv === Environment.production;
};
