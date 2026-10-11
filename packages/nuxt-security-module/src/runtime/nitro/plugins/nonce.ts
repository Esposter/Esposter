import type { NitroAppPlugin } from "nitro/types";

import { generateNonce } from "#src/runtime/services/generateNonce";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";
import { getSecurityState } from "#src/runtime/services/getSecurityState";
import { injectNonce } from "#src/runtime/services/injectNonce";
import { definePlugin } from "nitro";

const HTML_SECTIONS = ["body", "bodyAppend", "bodyPrepend", "head"] as const;

// A nonce for every request that is not a prerender, written into the page's own tags.
// So the policy's nonce matches the nonce the markup carries.
// The nonce is generated on `render:route`, once per request before the page renders.
// The security headers plugin reads it on the same hook, which is why this plugin is registered first.
const noncePlugin: NitroAppPlugin = definePlugin((nitroApp) => {
  if (import.meta.prerender) return;

  nitroApp.hooks.hook("render:route", (_context, { event }) => {
    const rules = getSecurityRules(event);
    if (rules?.enabled && rules.nonce) getSecurityState(event).nonce = generateNonce();
  });

  nitroApp.hooks.hook("render:html", (html, { event }) => {
    const rules = getSecurityRules(event);
    const nonce = getSecurityState(event).nonce;
    if (!rules?.enabled || !rules.nonce || !rules.headers || !rules.headers.contentSecurityPolicy || !nonce) return;

    for (const section of HTML_SECTIONS)
      html[section] = html[section].map((element: string) => injectNonce(element, nonce));
  });
});

export default noncePlugin;
