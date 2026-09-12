import type { Plugin } from "@oxlint/plugins";

import { noUnhandledEffectAfterEmit } from "#src/services/oxlint/persistThenNotify/noUnhandledEffectAfterEmit";
import { definePlugin } from "@oxlint/plugins";
// An oxlint JS plugin enforcing the persist-then-notify standard (/docs/architecture/persist-then-notify).
//
// Once a function fires a realtime notify (`<name>EventEmitter.emit(...)`), the entity exists and the
// Caller's outcome is decided — so every later `await` must be best-effort (never rejects) or the fatal
// Work must move before the emit. The check is purely syntactic, so it runs in oxlint's single root pass.
//
// Scoped to apps/web/server in the root .oxlintrc.json: only there does an emitter carry the
// Persist-then-notify meaning. Client emitters (e.g. the Phaser game bus) are a different concept.
const plugin: Plugin = definePlugin({
  meta: { name: "persist-then-notify" },
  rules: { "no-unhandled-effect-after-emit": noUnhandledEffectAfterEmit },
});

export default plugin;
