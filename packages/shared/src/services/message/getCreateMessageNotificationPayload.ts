import { PUSH_NOTIFICATION_MAX_LENGTH } from "@/services/message/constants";
import { truncate } from "@/util/text/truncate";
import parse from "node-html-parser";

export const getCreateMessageNotificationPayload = (
  message: string,
  { icon, title, url }: { icon?: null | string; title?: null | string; url: string },
): string | undefined => {
  let textContent: string | undefined = message;

  try {
    textContent = parse(message).querySelector("p")?.textContent;
    // eslint-disable-next-line no-empty
  } catch {}

  if (!textContent) return;

  return JSON.stringify({
    body: truncate(textContent, PUSH_NOTIFICATION_MAX_LENGTH),
    data: { url },
    icon,
    title,
  });
};
