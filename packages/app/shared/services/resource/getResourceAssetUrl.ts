import { RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";

// `encodeURIComponent` leaves `!'()*` literal — the same characters that delimit a css `url('…')` — so they
// Are additionally percent-encoded to close the emitted charset to `[\w.~%-]`. Mirrors `encodeBlobUrl` in
// `@esposter/db`, which is server-only and cannot be imported here
const EncodedSubDelimiterMap: Record<string, string> = {
  "!": "%21",
  "'": "%27",
  "(": "%28",
  ")": "%29",
  "*": "%2A",
};
const UNESCAPED_SUB_DELIMITER_REGEX = /[!'()*]/gu;

const encodeSegment = (segment: string) =>
  encodeURIComponent(segment).replaceAll(
    UNESCAPED_SUB_DELIMITER_REGEX,
    (character) => EncodedSubDelimiterMap[character] ?? character,
  );

export const getResourceAssetUrl = (blobName: string) =>
  `${RESOURCE_ASSETS_URL_PREFIX}/${blobName.split("/").map(encodeSegment).join("/")}`;
