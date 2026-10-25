import { SITE_NAME_ALLOWED_REGEX, SITE_NAME_REGEX } from "#src/services/oxlint/naming/constants";

export const checkIsSiteNameSpelled = (text: string): boolean =>
  SITE_NAME_REGEX.test(text.replaceAll(SITE_NAME_ALLOWED_REGEX, ""));
