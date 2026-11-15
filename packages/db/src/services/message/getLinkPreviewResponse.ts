import type { LinkPreviewResponse } from "@esposter/db-schema";

import { getResultAsync } from "@esposter/shared";
import { getLinkPreview } from "link-preview-js/mobile";
import { find } from "linkifyjs";
import { parse } from "node-html-parser";

// The entry without undici: a Worker's fetch reaches only the public internet, so the connection pinning the Node entry
// Adds against a loopback redirect guards nothing here, and undici's module-scope require fails a Worker at load
export const getLinkPreviewResponse = (message: string): Promise<LinkPreviewResponse | null> => {
  const messageHtml = parse(message);
  const url = messageHtml.querySelector("a")?.getAttribute("href");
  if (!url) return Promise.resolve(null);

  const link = find(url, "url", { defaultProtocol: "https" })[0];
  if (!link) return Promise.resolve(null);

  return getResultAsync(() => getLinkPreview(link.href))
    .orTee(console.error)
    .unwrapOr(null);
};
