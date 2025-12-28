import { useIsProduction } from "@@/server/composables/useIsProduction";

export const useSearchBaseUrl = () => {
  const isProduction = useIsProduction();
  return isProduction
    ? "https://pshpsrchespauea001.search.windows.net"
    : "https://dshpsrchespauea001.search.windows.net";
};
