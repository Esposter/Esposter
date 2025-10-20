export const useFunctionAppBaseUrl = () => {
  const isProduction = useIsProduction();
  return isProduction
    ? "https://p-shp-func-esposter-auea-001.azurewebsites.net"
    : "https://d-shp-func-esposter-auea-001.azurewebsites.net";
};
