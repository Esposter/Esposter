import type { ResourceAssetPath } from "#shared/models/resource/ResourceAssetPath";

import { relativizeOwnAssetUrls } from "#server/services/resource/relativizeOwnAssetUrls";
import { RESOURCE_ASSET_URL_REGEX } from "#shared/services/resource/constants";
import { parseResourceAssetPath } from "#shared/services/resource/parseResourceAssetPath";
import { deepVisitStrings } from "#shared/util/object/deepVisitStrings";

// The asset addresses a content value names, each url as written mapped to the path it addresses; a url that is not an
// Address is left out. The content is relativized before it is scanned, so an own-origin absolute url is found in the
// Same form as a relative one, and it comes back in that form: a caller that rewrites the urls it found rewrites the
// Content the scan read, so the two cannot disagree about which urls exist
export const collectResourceAssetPaths = <TContent>(content: TContent) => {
  const relativizedContent = relativizeOwnAssetUrls(content);
  const resourceAssetPaths = new Map<string, ResourceAssetPath>();
  deepVisitStrings(relativizedContent, (value) => {
    for (const match of value.matchAll(RESOURCE_ASSET_URL_REGEX)) {
      const resourceAssetPath = parseResourceAssetPath(match.groups?.encodedPath ?? "");
      if (resourceAssetPath) resourceAssetPaths.set(match[0], resourceAssetPath);
    }
  });
  return { content: relativizedContent, resourceAssetPaths };
};
