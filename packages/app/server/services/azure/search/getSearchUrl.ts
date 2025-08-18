import { IS_PRODUCTION } from "../../../../shared/util/environment/constants";

export const getSearchUrl = () =>
  IS_PRODUCTION ? "https://pshpsrchespauea001.search.windows.net" : "https://dshpsrchespauea001.search.windows.net";
