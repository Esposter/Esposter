import { IS_PRODUCTION } from "#shared/util/environment/constants";

export const AZURE_FUNCTION_APP_BASE_URL = IS_PRODUCTION
  ? "https://p-shp-func-esposter-auea-001.azurewebsites.net"
  : "https://d-shp-func-esposter-auea-001.azurewebsites.net";
