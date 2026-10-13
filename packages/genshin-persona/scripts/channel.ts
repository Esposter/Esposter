import type { IncomingMessage, ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { checkIsChannelRequestAllowed } from "#src/services/checkIsChannelRequestAllowed";
import { createChannelPage } from "#src/services/createChannelPage";
import { readChannelLine } from "#src/services/readChannelLine";
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";

// The chat window's MCP server, started with the session over stdio. It serves the page on the loopback under a token
// Printed once to the terminal, takes typed lines into the session as channel events, and offers the reply tool that
// Sends the plain half of an answer back to the page. The character's spoken lines need no forwarding: the message
// Display hook already reads them to the viewer
const token = randomBytes(16).toString("hex");
const replyStreams = new Set<ServerResponse>();

const mcp = new Server(
  { name: "genshin-persona", version: "4.0.0" },
  {
    capabilities: { experimental: { "claude/channel": {} }, tools: {} },
    instructions:
      'Lines typed at the desk arrive as <channel source="genshin-persona" sender="desk">. The character\'s spoken lines already reach the viewer, so do not forward them. When a desk line asks something, also call the reply tool with the plain half of the answer; the desk reads it on the chat page.',
  },
);

mcp.setRequestHandler(ListToolsRequestSchema, () => ({
  tools: [
    {
      description: "Show the plain half of an answer to a line typed at the desk on the chat page",
      inputSchema: { properties: { text: { type: "string" } }, required: ["text"], type: "object" },
      name: "reply",
    },
  ],
}));

mcp.setRequestHandler(CallToolRequestSchema, (request) => {
  if (request.params.name !== "reply") throw new Error(`Unknown tool ${request.params.name}`);

  const text = String(request.params.arguments?.text ?? "");
  for (const stream of replyStreams) stream.write(`event: reply\ndata: ${JSON.stringify({ text })}\n\n`);
  return { content: [{ text: "sent", type: "text" }] };
});

const writeEnded = (response: ServerResponse, statusCode: number) => {
  response.writeHead(statusCode).end();
};

const handleSay = (request: IncomingMessage, response: ServerResponse) => {
  let body = "";
  request.on("data", (chunk: Buffer) => {
    body += chunk.toString();
  });
  request.on("end", () => {
    const line = readChannelLine(body);
    if (line === undefined) return writeEnded(response, 400);

    void mcp.notification({
      method: "notifications/claude/channel",
      params: { content: line, meta: { sender: "desk" } },
    });
    writeEnded(response, 204);
  });
};

const handleEvents = (request: IncomingMessage, response: ServerResponse) => {
  response.writeHead(200, { "cache-control": "no-cache", "content-type": "text/event-stream" });
  response.write(": open\n\n");
  replyStreams.add(response);
  request.on("close", () => replyStreams.delete(response));
};

const http = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  const [, presentedToken = "", route = ""] = url.pathname.split("/");
  if (!checkIsChannelRequestAllowed(request.socket.remoteAddress, presentedToken, token))
    return writeEnded(response, 404);

  if (route === "" && request.method === "GET") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(createChannelPage());
    return;
  }
  if (route === "events" && request.method === "GET") return handleEvents(request, response);
  if (route === "say" && request.method === "POST") return handleSay(request, response);
  writeEnded(response, 404);
});

http.listen(0, "127.0.0.1", () => {
  const { port } = http.address() as AddressInfo;
  console.error(`Chat into the session: http://127.0.0.1:${port}/${token}/`);
});

await mcp.connect(new StdioServerTransport());
