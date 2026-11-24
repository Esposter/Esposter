import { HOSTED_ASSET_CONTENT_TYPES } from "hosted-assets";

// A hosted object is named by the sha256 its last segment holds, under the scope before it, and its extension names its
// Content type. That one shape is what a dataset's JSON and every other hosted file share, so a dataset needs no rule
// Of its own.
const HOSTED_OBJECT_NAME_REGEX = /^.+\/(?<hash>[\da-f]{64})(?<extension>\.[a-z\d]+)$/u;

// The hosted file a request under the mirror's base names, given the path after the base, or nothing when it
// Names none. A url with a `sha256` query names its file by that hash, since the content cache keeps each object under
// The hash of its bytes
export const parseGameDataObjectPath = (
  path: string,
): { contentType: string; hash: string; sourcePath: string } | undefined => {
  const [pathname = "", query = ""] = path.split("?");
  const sourcePath = pathname.replace(/^\//u, "");
  const sha256 = new URLSearchParams(query).get("sha256");
  if (sha256 !== null) return { contentType: "application/octet-stream", hash: sha256, sourcePath };
  const groups = HOSTED_OBJECT_NAME_REGEX.exec(sourcePath)?.groups;
  if (groups === undefined) return undefined;
  const contentType: string | undefined = HOSTED_ASSET_CONTENT_TYPES[groups.extension ?? ""];
  if (contentType === undefined) return undefined;
  return { contentType, hash: groups.hash ?? "", sourcePath };
};
