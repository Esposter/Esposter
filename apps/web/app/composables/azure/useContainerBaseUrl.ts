export const useContainerBaseUrl = () => {
  const runtimeConfig = useRuntimeConfig();
  return runtimeConfig.public.publicAssets.baseUrl;
};
