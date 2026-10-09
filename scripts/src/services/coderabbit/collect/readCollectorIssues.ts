import type { CollectorIssue } from "#src/models/coderabbit/collect/CollectorIssue";

import { COLLECTOR_ISSUE_LABEL, PULL_REQUEST_LIST_LIMIT } from "#src/services/coderabbit/collect/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// The open issues the collector opened, read off the viewer's own labelled issues so a stranger's issue quoting a
// Marker is never taken for one of them
export const readCollectorIssues = (viewerLogin: string): CollectorIssue[] =>
  parseMachineJson<CollectorIssue[]>(
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
