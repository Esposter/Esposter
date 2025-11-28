import { useRuntimeConfig } from "nuxt/app";

export const useContainerBaseUrl = () => {
  const runtimeConfig = useRuntimeConfig();
  return runtimeConfig.public.azure.container.baseUrl;
};
