import { IS_PRODUCTION } from "#shared/util/environment/constants";

export const getAzureFunctionAppBaseUrl = () =>
  IS_PRODUCTION
    ? "https://p-shp-func-esposter-auea-001.azurewebsites.net"
    : "https://d-shp-func-esposter-auea-001.azurewebsites.net";
