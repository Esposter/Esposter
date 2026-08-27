import { API_URL } from "@/services/desmos/constants";
import { checkIsServer } from "@esposter/shared";

export const useDesmos = () =>
  useScript<typeof Desmos>(API_URL, {
    use: () => (checkIsServer() ? undefined : window.Desmos),
  });
