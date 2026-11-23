import { HOSTED_ASSET_CONTENT_TYPES } from "hosted-assets";

// A hosted object is named by the sha256 its last segment holds, under the scope before it, and its extension names its
// Content type. The one shape a dataset's JSON and every other hosted file share, which is why a dataset needs no rule of its own
const HOSTED_OBJECT_NAME_REGEX = /^(?<scope>.+)\/(?<hash>[\da-f]{64})(?<extension>\.[a-z\d]+)$/u;

// The hosted file a request under the mirror's base names, given the path after the base, or nothing when it names none.
// A file a url carries a `sha256` for is named by that hash, since the content cache keeps every object under the hash of
// Its bytes, and a hosted object is named by the hash its name holds
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
