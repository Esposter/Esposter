import type { CollectorIssueInput } from "#src/models/coderabbit/collect/CollectorIssueInput";

import { COLLECTOR_ISSUE_LABEL, PULL_REQUEST_LIST_LIMIT } from "#src/services/coderabbit/collect/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// The one way the collector hands work it routed around to whoever picks up the tracker: one open issue per marker,
// Read off the viewer's own labelled issues so a stranger's issue quoting the marker opens nothing in its place. A gh
// Failure is thrown rather than swallowed: an outage idles the run (`GITHUB_OUTAGE_REGEX`), the next run asks again,
// And the marker keeps that to one issue
export const openCollectorIssue = ({ body, isDryRun, marker, title, viewerLogin }: CollectorIssueInput): void => {
  const openIssues = parseMachineJson<{ body: string; number: number }[]>(
    runGh([
      "issue",
      "list",
      "--state",
      "open",
      "--author",
      viewerLogin,
      "--label",
      COLLECTOR_ISSUE_LABEL,
      "--limit",
      PULL_REQUEST_LIST_LIMIT.toString(),
      "--json",
      "number,body",
    ]),
  );
  const openIssue = openIssues.find((issue) => issue.body.includes(marker));
  if (openIssue !== undefined) {
    console.info(`issue #${openIssue.number} is already open: ${title}`);
    return;
  } else if (isDryRun) {
    console.info(`would open an issue: ${title}`);
    return;
  }

  runGh(["issue", "create", "--title", title, "--label", COLLECTOR_ISSUE_LABEL, "--body", `${marker}\n${body}`]);
  console.info(`opened an issue: ${title}`);
};
