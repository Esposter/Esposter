import { IS_PRODUCTION } from "#shared/util/environment/constants";

export const AZURE_SEARCH_BASE_URL = IS_PRODUCTION
  ? "https://pshpsrchespauea001.search.windows.net"
  : "https://dshpsrchespauea001.search.windows.net";
