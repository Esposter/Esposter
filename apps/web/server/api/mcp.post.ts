import { auth } from "#server/auth";
import { getAgentSessionPayload } from "#server/services/auth/getAgentSessionPayload";
import { createMcpServer } from "#server/services/mcp/createMcpServer";
import { createContext } from "#server/trpc/context";
import { trpcRouter } from "#server/trpc/routers";
import { withFinalizerAsync } from "@esposter/shared";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { defineEventHandler } from "nuxt/server";

// The Model Context Protocol over its Streamable HTTP transport, stateless: each POST builds a server, answers one
// Message and returns. This server never pushes unprompted, so the router's 405 to any other method is the answer the
// Transport allows (/docs/architecture/agent-access)
export default defineEventHandler(async (event) => {
  // The transport requires `Origin` to be validated so no web page can drive the endpoint from a reader's browser. Its
  // Callers are command-line clients, which send none, so a request carrying one is refused before its key is read
  if (event.req.headers.has("origin")) {
    event.res.status = 403;
    return { message: "The MCP endpoint takes no requests from a browser." };
  }

  const key = /^Bearer (?<key>\S+)$/u.exec(event.req.headers.get("authorization") ?? "")?.groups?.key;
  if (!key) {
    event.res.status = 401;
    return { message: "An API key is required as a bearer token." };
  }

  const { error, key: apiKey } = await auth.api.verifyApiKey({ body: { key } });
  if (!apiKey) {
    event.res.status = error && ["RATE_LIMITED", "USAGE_EXCEEDED"].includes(error.code) ? 429 : 401;
    return { message: error?.message ?? "Invalid API key." };
  }

  const ctx = createContext(event);
  const user = await ctx.db.query.usersInAuth.findFirst({ where: { id: { eq: apiKey.referenceId } } });
  if (!user) {
    event.res.status = 401;
    return { message: "Invalid API key." };
  }

  const server = createMcpServer(trpcRouter, { ...ctx, getSessionPayload: getAgentSessionPayload(user, apiKey.id) });
  const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: true });
  await server.connect(transport);
  // A JSON response is whole once it resolves, so the server closes with it
  return withFinalizerAsync(
    () => transport.handleRequest(event.req),
    () => server.close(),
  );
});
