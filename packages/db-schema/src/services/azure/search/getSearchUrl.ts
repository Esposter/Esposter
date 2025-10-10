import { getIsProduction } from "@esposter/shared";

export const getSearchUrl = (): string =>
  getIsProduction() ? "https://pshpsrchespauea001.search.windows.net" : "https://dshpsrchespauea001.search.windows.net";
