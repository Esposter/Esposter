import type { InvocationContext } from "@azure/functions";

import { PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH } from "@/services/constants";
import { truncate } from "@esposter/shared";
import parse from "node-html-parser";

export const getCreateMessageNotificationPayload = (
  context: InvocationContext,
  message: string,
  { icon, title, url }: { icon?: null | string; title?: null | string; url: string },
): string | undefined => {
  let textContent: string | undefined = message;

  try {
    textContent = parse(message).querySelector("p")?.structuredText?.trim();
  } catch (error) {
    context.error(`Failed to create message notification payload for message ${message}: `, error);
  }

  if (!textContent) return undefined;

  return JSON.stringify({
    body: truncate(textContent, PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH),
    data: { url },
    icon,
    title,
  });
};
