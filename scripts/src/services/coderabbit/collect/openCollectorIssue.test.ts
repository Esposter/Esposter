import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import {
  COLLECTOR_ISSUE_LABEL,
  HELD_MARKER,
  PULL_REQUEST_LIST_LIMIT,
} from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { openCollectorIssue } from "#src/services/coderabbit/collect/openCollectorIssue";
import { describe, expect, test, vi } from "vitest";

const { runGh } = vi.hoisted(() => ({ runGh: vi.fn<typeof baseRunGh>() }));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

describe(openCollectorIssue, () => {
  const marker = getMarker(HELD_MARKER, "");
  const input = { body: "", isDryRun: false, marker, title: "", viewerLogin: "" };

  // Every run that routes around the same work asks again, so the marker is what keeps it to one issue
  test("opens nothing while an open issue by the viewer carries the marker", () => {
    expect.hasAssertions();

    runGh.mockReturnValue(JSON.stringify([{ body: marker, number: 0 }]));
    openCollectorIssue(input);

    expect(runGh).toHaveBeenCalledExactlyOnceWith([
      "issue",
      "list",
      "--state",
      "open",
      "--author",
      "",
      "--label",
      COLLECTOR_ISSUE_LABEL,
      "--limit",
      PULL_REQUEST_LIST_LIMIT.toString(),
      "--json",
      "number,body",
    ]);
  });

  test("creates one issue labelled for an agent whose body leads with the marker", () => {
    expect.hasAssertions();

    runGh.mockReturnValue("[]");
    openCollectorIssue(input);

    expect(runGh).toHaveBeenCalledTimes(2);
    expect(runGh).toHaveBeenLastCalledWith([
      "issue",
      "create",
      "--title",
      "",
      "--label",
      COLLECTOR_ISSUE_LABEL,
      "--body",
      `${marker}\n`,
    ]);
  });
});
