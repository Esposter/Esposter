import type { NitroAppPlugin } from "nitro/types";

import { HTML_SECTIONS } from "#src/runtime/constants";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";
import { injectSubresourceIntegrity } from "#src/runtime/services/injectSubresourceIntegrity";
import { definePlugin } from "nitro";

// The plugin the module's server template calls with the hashes the build computed.
// Each script and stylesheet the build hashed gets its integrity attribute in the markup the page renders.
export const createSubresourceIntegrityPlugin = (sriHashes: Record<string, string>): NitroAppPlugin =>
  definePlugin((nitroApp) => {
    nitroApp.hooks.hook("render:html", (html, { event }) => {
      const rules = getSecurityRules(event);
      if (!rules?.enabled || !rules.sri) return;

      for (const section of HTML_SECTIONS)
        html[section] = html[section].map((element: string) => injectSubresourceIntegrity(element, sriHashes));
    });
  });
