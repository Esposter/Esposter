import { setupPluginSuite } from "#src/services/oxlint/setupPluginSuite.test";
import { describe } from "vitest";

describe("setupScope", () => {
  const RULE = "setup-scope/no-detached-mutation";
  const FIXTURES = [
    // A component's `<script setup>` top level is outside every function
    { name: "topLevel", source: `export const a = useMutation(b);`, violations: 0 },
    { name: "storeSetup", source: `export const a = defineStore("a", () => useMutation(b));`, violations: 0 },
    { name: "nuxtPlugin", source: `export default defineNuxtPlugin(() => useMutation(a));`, violations: 0 },
    { name: "composableArrow", source: `export const useA = () => useMutation(b);`, violations: 0 },
    { name: "composableDeclaration", source: `export function useA() { return useMutation(b); }`, violations: 0 },
    { name: "action", source: `export const a = () => useMutation(b);`, violations: 1 },
    // A callback inside a setup scope runs later, once per call, so it is not the setup itself
    { name: "callbackInsideSetup", source: `export const useA = () => () => useMutation(b);`, violations: 1 },
    { name: "callsOtherFunction", source: `export const a = () => useOther(b);`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "setupScope", rules: [RULE] });
});
