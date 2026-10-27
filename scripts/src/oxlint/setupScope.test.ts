import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("setupScope", () => {
  const CALLEE = "useMutation";
  const PLUGIN_DEFINER = "defineNuxtPlugin";
  const PREFIX = "use";
  const STORE_DEFINER = "defineStore";
  const RULE = "setup-scope/no-detached-mutation";
  const FIXTURES = [
    // A component's `<script setup>` top level is outside every function
    { name: "topLevel", source: `export const a = ${CALLEE}(b);`, violations: 0 },
    { name: "storeSetup", source: `export const a = ${STORE_DEFINER}("a", () => ${CALLEE}(b));`, violations: 0 },
    { name: "nuxtPlugin", source: `export default ${PLUGIN_DEFINER}(() => ${CALLEE}(a));`, violations: 0 },
    { name: "composableArrow", source: `export const ${PREFIX}A = () => ${CALLEE}(b);`, violations: 0 },
    { name: "composableDeclaration", source: `export function ${PREFIX}A() { return ${CALLEE}(b); }`, violations: 0 },
    { name: "action", source: `export const a = () => ${CALLEE}(b);`, violations: 1 },
    // A callback inside a setup scope runs later, once per call, so it is not the setup itself
    { name: "callbackInsideSetup", source: `export const ${PREFIX}A = () => () => ${CALLEE}(b);`, violations: 1 },
    { name: "callsOtherFunction", source: `export const a = () => f(b);`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "setupScope", rules: [RULE] });
});
