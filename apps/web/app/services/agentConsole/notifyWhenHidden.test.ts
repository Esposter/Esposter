import { notifyWhenHidden } from "@/services/agentConsole/notifyWhenHidden";
import { describe, expect, onTestFinished, test, vi } from "vitest";

describe(notifyWhenHidden, () => {
  const title = "title";
  const body = "body";

  // The node environment declares no Notification global, as a browser without the API does
  test("sends nothing where the browser has no notifications", () => {
    expect.hasAssertions();

    vi.stubGlobal("window", { document: { hidden: true } });
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    expect(notifyWhenHidden(title, body)).toBeUndefined();
  });
});
