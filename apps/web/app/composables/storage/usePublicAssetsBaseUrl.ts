export const usePublicAssetsBaseUrl = () => {
  const runtimeConfig = useRuntimeConfig();
  return runtimeConfig.public.publicAssets.baseUrl;
};
