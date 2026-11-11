import type { LinkPreviewResponse } from "@esposter/db-schema";

import { getResultAsync } from "@esposter/shared";
import { getLinkPreview } from "link-preview-js";
import { find } from "linkifyjs";
import { parse } from "node-html-parser";

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
