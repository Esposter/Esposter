import type { LinkPreviewResponse } from "#shared/models/esbabbler/linkPreview/LinkPreviewResponse";

import { getLinkPreview } from "link-preview-js";
import { find } from "linkifyjs";
import { parse } from "node-html-parser";
import { lookup } from "node:dns";

export const getLinkPreviewResponse = async (message: string): Promise<LinkPreviewResponse | undefined> => {
  const messageHtml = parse(message);
  const anchor = messageHtml.querySelector("a");
  if (!anchor) return undefined;

  const link = find(anchor.textContent, "url", { defaultProtocol: "https" }).find(Boolean);
  if (!link) return undefined;

  try {
    return await getLinkPreview(link.href, {
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
    return undefined;
  }
};
