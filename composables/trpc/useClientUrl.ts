export const useClientUrl = () => {
  const config = useRuntimeConfig();
  return `${config.public.baseUrl}${TRPC_CLIENT_PATH}`;
};
