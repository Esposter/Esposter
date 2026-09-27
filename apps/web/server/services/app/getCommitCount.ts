import { getResultAsync, SITE_NAME } from "@esposter/shared";

// The count identifies the running build, so a process asks GitHub once rather than once per caller: the
// Unauthenticated API allows a handful of requests an hour per address, and a public procedure spending one per call
// Would let anyone exhaust it for every visitor. The read in flight is what is kept, so callers arriving before it
// Answers share it rather than each starting their own. A failed read answers 0 and is not kept, so the next caller
// Retries
let commitCountPromise: Promise<number> | undefined;

export const getCommitCount = async () => {
  const currentCommitCountPromise = (commitCountPromise ??= getResultAsync(() =>
    fetch(`https://api.github.com/repos/${SITE_NAME}/${SITE_NAME}/commits?per_page=1&page=1`),
  ).match(
    // The last number in the Link header is the last page, which at one commit per page is the commit count
    ({ headers }) => Number(headers.get("Link")?.match(/(?<count>\d+)(?!.*\d)/u)?.groups?.count ?? "0"),
    (error) => {
      console.error(error);
      return 0;
    },
  ));
  const commitCount = await currentCommitCountPromise;
  if (!commitCount && commitCountPromise === currentCommitCountPromise) commitCountPromise = undefined;
  return commitCount;
};
