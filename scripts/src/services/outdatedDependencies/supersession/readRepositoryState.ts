import { FETCH_TIMEOUT_MS, MAX_BUFFER_BYTES } from "#src/services/shared/constants";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

// `gh api` follows a renamed repository's redirect, so the name it returns is the one GitHub serves now. Asked without
// Blocking, so a batch's requests overlap, and throws when the request fails, which the caller reports rather than
// Reading as a repository that is current.
export const readRepositoryState = async (repository: string): Promise<{ fullName: string; isArchived: boolean }> => {
  const { stdout } = await promisify(execFile)(
    "gh",
    ["api", `repos/${repository}`, "--jq", "[.full_name, .archived] | @tsv"],
    { encoding: "utf8", maxBuffer: MAX_BUFFER_BYTES, timeout: FETCH_TIMEOUT_MS },
  );
  const [fullName = "", isArchived = ""] = stdout.trim().split("\t");

  return { fullName, isArchived: isArchived === "true" };
};
