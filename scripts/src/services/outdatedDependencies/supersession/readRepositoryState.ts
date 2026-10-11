import { runGh } from "#src/services/shared/runGh";

// `gh api` follows a renamed repository's redirect, so the name it returns is the one GitHub serves now. Throws when
// The request fails, which the caller reports rather than reading as a repository that is current.
export const readRepositoryState = (repository: string): { fullName: string; isArchived: boolean } => {
  const [fullName = "", isArchived = ""] = runGh([
    "api",
    `repos/${repository}`,
    "--jq",
    "[.full_name, .archived] | @tsv",
  ])
    .trim()
    .split("\t");

  return { fullName, isArchived: isArchived === "true" };
};
