import { MOBILE_REGEX, NOT_MOBILE_REGEX } from "@/util/device/constants";
import { getIsServer } from "@esposter/shared";

export const checkIsMobile = () => {
  if (getIsServer()) return false;
  const userAgent = window.navigator.userAgent;
  return MOBILE_REGEX.test(userAgent) && !NOT_MOBILE_REGEX.test(userAgent);
};
