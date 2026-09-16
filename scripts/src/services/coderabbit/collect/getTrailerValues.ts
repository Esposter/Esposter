const VALUE_SEPARATOR = ",";

// Every value a trailer key carries in a commit body, read off the whole body rather than `%(trailers:key=…)`,
// Which reads only the last contiguous trailer block: every commit ends with the attribution line, so a trailer
// A paragraph earlier would read as absent. A key repeated on its own line and a comma list read the same.
export const getTrailerValues = (body: string, key: string): string[] =>
  [...body.matchAll(new RegExp(String.raw`^[ \t]*${key}:(?<values>.*)$`, "gimu"))]
    .flatMap(({ groups }) => (groups?.values ?? "").split(VALUE_SEPARATOR))
    .map((value) => value.trim())
    .filter(Boolean);
