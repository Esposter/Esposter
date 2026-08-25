import type { InvocationContext } from "@azure/functions";

import { getResult, normalizeString } from "@esposter/shared";
import { parse } from "node-html-parser";

// A message is stored as the editor's HTML, and a notification body is plain text — the first paragraph, or the
// Whole document when there is no paragraph to pick. Undefined for a message that renders to nothing at all (an
// Attachment-only send, an unparseable document), which is the one case where there is no notification to deliver.
export const getMessageNotificationBody = (context: InvocationContext, message: string): string | undefined =>
  getResult(() => {
    const root = parse(message);
    return normalizeString(root.querySelector("p")?.structuredText ?? root.structuredText);
  }).match(
    (textContent) => textContent || undefined,
    (error) => {
      context.error("Failed to read message notification body", { error, messageLength: message.length });
      return undefined;
    },
  );
