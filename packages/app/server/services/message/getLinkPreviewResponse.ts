import type { LinkPreviewResponse } from "@esposter/db";

import { getLinkPreview } from "link-preview-js";
import { find } from "linkifyjs";
import { parse } from "node-html-parser";
import { lookup } from "node:dns";

export const getLinkPreviewResponse = (message: string): Promise<LinkPreviewResponse | null> => {
  const messageHtml = parse(message);
  const url = messageHtml.querySelector("a")?.getAttribute("href");
  if (!url) return Promise.resolve(null);

  const link = find(url, "url", { defaultProtocol: "https" }).find(Boolean);
  if (!link) return Promise.resolve(null);

  try {
    return getLinkPreview(link.href, {
      resolveDNSHost: (url) =>
        new Promise((resolve, reject) => {
          const hostname = new URL(url).hostname;
          lookup(hostname, (err, address) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(address);
          });
        }),
    });
  } catch {
    return Promise.resolve(null);
  }
};
