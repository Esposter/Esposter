export const useSearchBaseUrl = () => {
  const runtimeConfig = useRuntimeConfig();
  return runtimeConfig.azure.search.baseUrl;
};
