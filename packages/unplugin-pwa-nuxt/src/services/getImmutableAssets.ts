import type { Nuxt } from "@nuxt/schema";

const SLASH_ENDS_REGEX = /^\/|\/$/gu;

// The folder every hashed build file is served from, which the precache keeps without a revision of its own
export const getImmutableAssets = ({ options }: Nuxt): string =>
  options.app.buildAssetsDir.replaceAll(SLASH_ENDS_REGEX, "");
