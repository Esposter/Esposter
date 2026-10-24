import { getBaseUrl } from "#server/services/app/getBaseUrl";
import { RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";
import { deepReplaceStrings } from "#shared/util/object/deepReplaceStrings";

// An absolute url of ours is still ours, but the asset regex refuses it on purpose: the lookbehind is what keeps a
// Foreign absolute url carrying our prefix from being rewritten into a local one. Only the origin tells the two apart,
// So same-origin urls are relativized rather than the anchor being loosened for both. The app mints this form itself
// When it absolutizes for email, so exported html pasted back into an editor re-enters content with it. Read off the
// Environment rather than through `useRuntimeConfig`, because this is a plain service called from tests that hold no
// Nuxt app
export const relativizeOwnAssetUrls = <TContent>(content: TContent): TContent => {
  const baseUrl = getBaseUrl();
  return baseUrl
    ? deepReplaceStrings(content, (value) =>
        value.replaceAll(`${baseUrl}${RESOURCE_ASSETS_URL_PREFIX}/`, `${RESOURCE_ASSETS_URL_PREFIX}/`),
      )
    : content;
};
