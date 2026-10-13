import type { Query } from "@anthropic-ai/claude-agent-sdk";

import { InvalidOperationError, Operation } from "@esposter/shared";

export interface McpAppResource {
  html: string;
  meta: Record<string, unknown>;
}

/**
 * One MCP Apps widget, read from the server the session's CLI dialed. The contents are untrusted third-party HTML,
 * so only a ui:// resource of an HTML type is accepted, and its own _meta (the csp and permissions the app declares)
 * travels with it for the host to enforce
 */
export const readMcpAppResource = async (
  query: Pick<Query, "readMcpResource">,
  serverName: string,
  uri: string,
): Promise<McpAppResource> => {
  if (!uri.startsWith("ui://"))
    throw new InvalidOperationError(Operation.Read, uri, "an MCP app is read from a ui:// resource only");

  const { contents } = await query.readMcpResource(serverName, uri);
  const [content] = contents;
  if (content?.text === undefined || !content.mimeType?.startsWith("text/html"))
    throw new InvalidOperationError(Operation.Read, uri, "the server returned no HTML for the app");

  // oxlint-disable-next-line no-underscore-dangle -- `_meta` is the MCP wire field name the SDK types
  return { html: content.text, meta: content._meta ?? {} };
};
