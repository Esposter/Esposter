import { RESOURCE_ASSET_URL_REGEX } from "#shared/services/resource/constants";

// Asset urls are absolutized so a downloaded file points back at the app instead of resolving relative to wherever the
// file was opened. They only load where the request carries the owner's session cookie, so a file opened straight off
// disk shows broken images until durable public asset urls exist
export const absolutizeResourceAssetUrls = (html: string, origin: string) =>
  html.replaceAll(RESOURCE_ASSET_URL_REGEX, (url) => `${origin}${url}`);
