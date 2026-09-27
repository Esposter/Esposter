import { SITE_NAME } from "@esposter/shared";

// The count identifies the running build, so a process asks GitHub once rather than once per caller: the
// Unauthenticated API allows a handful of requests an hour per address, and a public procedure spending one per call
// Would let anyone exhaust it for every visitor. A failed read answers 0 and is not kept, so the next caller retries
let commitCount = 0;

export const getCommitCount = async () => {
  if (commitCount) return commitCount;
  const { headers } = await fetch(`https://api.github.com/repos/${SITE_NAME}/${SITE_NAME}/commits?per_page=1&page=1`);
  // The last number in the Link header is the last page, which at one commit per page is the commit count
  commitCount = Number(headers.get("Link")?.match(/(?<count>\d+)(?!.*\d)/u)?.groups?.count ?? "0");
  return commitCount;
};
