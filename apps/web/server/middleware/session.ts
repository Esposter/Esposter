import { readSession } from "@@/server/services/auth/readSession";

// A page's own request reads the session before it renders, so a day's extension rides back on the page's response:
// The render reads it again through an internal fetch whose cookies never reach the browser, and finds nothing left
// To extend. Every other request reads its own, or leaves the extension alone
export default defineEventHandler(async (event) => {
  if (!event.headers.get("accept")?.includes("text/html")) return;
  await readSession(event.headers, event.node.res);
});
