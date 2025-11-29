import { useRuntimeConfig } from "nitropack/runtime";

export const useContainerBaseUrl = () => {
  const runtimeConfig = useRuntimeConfig();
  return runtimeConfig.public.azure.container.baseUrl;
};
