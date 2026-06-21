import type { InvocationContext } from "@azure/functions";

import { PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { getResult, normalizeString, truncate } from "@esposter/shared";
import { parse } from "node-html-parser";

export const getCreateMessageNotificationPayload = (
  context: InvocationContext,
  message: string,
  { icon, title, url }: { icon?: null | string; title?: null | string; url: string },
): string | undefined => {
  const textContent = getResult(() => {
    const root = parse(message);
    return normalizeString(root.querySelector("p")?.structuredText ?? root.structuredText);
  }).match(
    (newTextContent) => newTextContent,
    (error) => {
      context.error("Failed to create message notification payload", { error, messageLength: message.length });
      return undefined;
    },
  );
  if (!textContent) return undefined;

  return JSON.stringify({
    body: truncate(textContent, PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH),
    data: { url },
    icon,
    title,
  });
};
