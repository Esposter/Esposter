import { MOBILE_REGEX, NOT_MOBILE_REGEX } from "@/util/device/constants";

export const checkIsMobile = () => {
  if (typeof navigator === "undefined") return false;
  const userAgent = navigator.userAgent;
  return MOBILE_REGEX.test(userAgent) && !NOT_MOBILE_REGEX.test(userAgent);
};
