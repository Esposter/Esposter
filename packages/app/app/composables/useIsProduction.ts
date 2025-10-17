import { Environment } from "#shared/models/environment/Environment";

export const useIsProduction = () => {
  const runtimeConfig = useRuntimeConfig();
  return runtimeConfig.public.appEnv === Environment.production;
};
