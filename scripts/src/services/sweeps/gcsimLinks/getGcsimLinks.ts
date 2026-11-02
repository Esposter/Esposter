import { GCSIM_REPOSITORY_URL, GCSIM_TAG } from "#src/services/genshinAssets/kits/constants";

// The characters a link's ref ends before: a path, a query or a fragment, whitespace, or the bracket or quote the link is
// Written in. The ref ends at one of them, so the tag is only the tag where it ends at one too
const REF_END = String.raw`/#?\s)\]>"'\x60`;
// A link into gcsim's tree at any ref but the tag the kits are read at, whose later refs are under gcsim's own licence
const GCSIM_LINK_REGEX = new RegExp(
  String.raw`${RegExp.escape(GCSIM_REPOSITORY_URL)}/(?:blob|tree)/(?!${RegExp.escape(GCSIM_TAG)}(?=[${REF_END}]|$))[^${REF_END}]+`,
  "gu",
);
// Every link on a line into gcsim's tree at a ref other than the tag
export const getGcsimLinks = (line: string): string[] => Array.from(line.matchAll(GCSIM_LINK_REGEX), ([link]) => link);
