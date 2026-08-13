import type { InvocationContext } from "@azure/functions";

import { getPushNotificationPayload } from "@/services/getPushNotificationPayload";
import { getResult, normalizeString } from "@esposter/shared";
import { parse } from "node-html-parser";

export const getCreateMessageNotificationPayload = (
  context: InvocationContext,
  message: string,
  { icon, path, title }: { icon?: null | string; path: string; title?: null | string },
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

  return getPushNotificationPayload({ body: textContent, icon, path, title });
};
