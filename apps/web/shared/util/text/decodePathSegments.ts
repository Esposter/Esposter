import { getDecodedUriComponent } from "#shared/util/text/getDecodedUriComponent";

// The segments of a url path, each decoded. A segment that decodes to nothing, which a malformed escape does, or to a
// Separator names no segment a publisher wrote, so the whole path is absent rather than a different one
export const decodePathSegments = (encodedPath: string): string[] | undefined => {
  const decodedSegments: string[] = [];
  for (const segment of encodedPath.split("/")) {
    const decodedSegment = getDecodedUriComponent(segment, "");
    if (!decodedSegment || decodedSegment.includes("/")) return undefined;
    decodedSegments.push(decodedSegment);
  }
  return decodedSegments;
};
