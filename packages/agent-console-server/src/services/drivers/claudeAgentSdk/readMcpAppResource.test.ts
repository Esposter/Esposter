import type { Query } from "@anthropic-ai/claude-agent-sdk";

import { readMcpAppResource } from "#src/services/drivers/claudeAgentSdk/readMcpAppResource";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

describe(readMcpAppResource, () => {
  const serverName = "calendar";
  const uri = "ui://calendar/month";
  const html = "<main>month</main>";
  const meta = { ui: { csp: { connectDomains: [] } } };

  test("reads the HTML and the app's own _meta from the server the CLI dialed", async () => {
    expect.hasAssertions();

    const readMcpResource = vi
      .fn<Query["readMcpResource"]>()
      .mockResolvedValue({ contents: [{ _meta: meta, mimeType: "text/html;profile=mcp-app", text: html, uri }] });

    await expect(readMcpAppResource({ readMcpResource }, serverName, uri)).resolves.toStrictEqual({ html, meta });
    expect(readMcpResource).toHaveBeenCalledWith(serverName, uri);
  });

  test("refuses a resource outside the ui:// scheme without asking the server", async () => {
    expect.hasAssertions();

    const readMcpResource = vi.fn<Query["readMcpResource"]>();

    await expect(
      readMcpAppResource({ readMcpResource }, serverName, "file://calendar/month"),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, "file://calendar/month", "an MCP app is read from a ui:// resource only").message}]`,
    );
    expect(readMcpResource).not.toHaveBeenCalled();
  });

  test("refuses a resource that is not HTML", async () => {
    expect.hasAssertions();

    const readMcpResource = vi
      .fn<Query["readMcpResource"]>()
      .mockResolvedValue({ contents: [{ mimeType: "application/json", text: "{}", uri }] });

    await expect(readMcpAppResource({ readMcpResource }, serverName, uri)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, uri, "the server returned no HTML for the app").message}]`,
    );
  });
});
