import { IS_PRODUCTION } from "@esposter/shared";

export const getSearchUrl = () =>
  IS_PRODUCTION ? "https://pshpsrchespauea001.search.windows.net" : "https://dshpsrchespauea001.search.windows.net";
