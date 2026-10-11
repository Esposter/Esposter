import type { NitroAppPlugin } from "nitro/types";

import { collectSsgHashes } from "#src/runtime/services/collectSsgHashes";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";
import { getSecurityState } from "#src/runtime/services/getSecurityState";
import { insertContentSecurityPolicyMeta } from "#src/runtime/services/insertContentSecurityPolicyMeta";
import { updateContentSecurityPolicy } from "#src/runtime/services/updateContentSecurityPolicy";
import { definePlugin } from "nitro";

const HTML_SECTIONS = ["head", "bodyPrepend", "body", "bodyAppend"] as const;

// A prerendered page has no response to carry its policy.
// So the policy is written as a `<meta>` element at the start of its head.
// It carries the hashes of the scripts and styles the page renders.
// Only the prerender runs it, as a served page has its nonce instead
const ssgHashes: NitroAppPlugin = definePlugin((nitroApp) => {
  if (!import.meta.prerender) return;

  nitroApp.hooks.hook("render:html", async (html, { event }) => {
    const rules = getSecurityRules(event);
    if (!rules?.enabled || !rules.ssg || !rules.headers || !rules.headers.contentSecurityPolicy) return;

    const state = getSecurityState(event);
    state.hashes = await collectSsgHashes(HTML_SECTIONS.map((section) => html[section].join("")).join(""), rules.ssg);
    if (!rules.ssg.meta) return;

    const policy = updateContentSecurityPolicy(rules.headers.contentSecurityPolicy, state);
    html.head = [insertContentSecurityPolicyMeta(html.head.join(""), policy)];
  });
});

export default ssgHashes;
