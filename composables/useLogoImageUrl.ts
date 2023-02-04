export const useLogoImageUrl = () => {
  const config = useRuntimeConfig();
  return `${config.public.azureBlobUrl}${LOGO_IMAGE_PATH}`;
};
