import { takeOne } from "@esposter/shared";

// The hosted file a request under the mirror's base names, given the path after the base, or nothing when it names
// None. A JSON object is named by the hash its last segment holds, under the dataset before it. Any other file is named
// By the `sha256` its url carries, since the content cache keeps every object under the hash of its bytes
export const parseGameDataObjectPath = (
  path: string,
): undefined | { contentType: string; hash: string; sourcePath: string } => {
  const [pathname = "", query = ""] = path.split("?");
  const sourcePath = pathname.replace(/^\//u, "");
  const sha256 = new URLSearchParams(query).get("sha256");
  if (sha256 !== null) return { contentType: "application/octet-stream", hash: sha256, sourcePath };
  if (!sourcePath.endsWith(".json")) return undefined;
  const segments = sourcePath.replace(/\.json$/u, "").split("/");
  const dataset = segments.slice(0, -1).join("/");
  if (dataset === "") return undefined;
  return { contentType: "application/json", hash: takeOne(segments.slice(-1)), sourcePath };
};
