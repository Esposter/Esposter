import { getLinkPreview } from "link-preview-js";
import { find } from "linkifyjs";
import { lookup } from "node:dns";

export const getLinkPreviewResponse = async (message: string) => {
  const url = find(message, "url", { defaultProtocol: "https" }).find(Boolean)?.value;
  if (!url) return undefined;

  return getLinkPreview(url, {
    resolveDNSHost: async (url) =>
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
};
