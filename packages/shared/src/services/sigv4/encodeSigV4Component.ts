// The five characters `encodeURIComponent` leaves bare and RFC 3986 reserves
const RESERVED_CHARACTER_ENCODING_MAP: Readonly<Record<string, string>> = {
  "!": "%21",
  "'": "%27",
  "(": "%28",
  ")": "%29",
  "*": "%2A",
};
// RFC 3986's encoding, which SigV4 signs
export const encodeSigV4Component = (component: string): string =>
  encodeURIComponent(component).replaceAll(
    /[!'()*]/gu,
    (character) => RESERVED_CHARACTER_ENCODING_MAP[character] ?? character,
  );
