import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("errorHandling", () => {
  const CONSTRUCTOR = "Error";
  const INVALID_OPERATION_ERROR = "InvalidOperationError";
  const FALLBACK_RULE = "error-handling/no-uncommented-fallback";
  const FINALIZER_RULE = "error-handling/no-unfinalized-resource";
  const RULE = "error-handling/no-bare-error";
  const FIXTURES = [
    { name: "throwsBareError", source: `export const a = () => { throw new ${CONSTRUCTOR}(""); };`, violations: 1 },
    { name: "rejectsWithBareError", source: `export const a = Promise.reject(new ${CONSTRUCTOR}(""));`, violations: 1 },
    {
      name: "throwsInvalidOperationError",
      source: `export const a = () => { throw new ${INVALID_OPERATION_ERROR}(); };`,
      violations: 0,
    },
    // A subclass is named for what it is; only the bare constructor says nothing.
    { name: "throwsErrorSubclass", source: `export const a = () => { throw new TypeError(""); };`, violations: 0 },
    {
      name: "unwrapsUncommentedUndefined",
      source: `export const a = (text) => getResult(() => JSON.parse(text)).unwrapOr(undefined);`,
      violations: 1,
    },
    {
      name: "unwrapsCommentedUndefined",
      source: `// A paste that is not our JSON is another source's text, so a failed parse is the expected answer\nexport const a = (text) => getResult(() => JSON.parse(text)).unwrapOr(undefined);`,
      violations: 0,
    },
    {
      name: "unwrapsLoggedUndefined",
      source: `export const a = (value) => getResult(() => value).orTee((error) => { console.error(error); }).unwrapOr(undefined);`,
      violations: 0,
    },
    // A comment above the function names the function, so the failure beside the call is still unexplained.
    {
      name: "unwrapsFunctionCommentedUndefined",
      source: `// Parses a paste\nexport const a = (text) =>\n  getResult(() => JSON.parse(text)).unwrapOr(undefined);`,
      violations: 1,
    },
    {
      name: "unwrapsSchemaFallback",
      source: `export const a = (value) => getResult(() => value).unwrapOr(schema);`,
      violations: 0,
    },
    {
      name: "matchesSilentErrArm",
      source: `export const a = (value) => getResult(() => value).match((ok) => ok, () => undefined);`,
      violations: 1,
    },
    {
      name: "matchesAlertedErrArm",
      source: `export const a = (value) => getResult(() => value).match((ok) => ok, (error) => { createErrorAlert(error); return false; });`,
      violations: 0,
    },
    {
      name: "matchesRecordingErrArm",
      source: `export const a = (value) => getResult(() => value).match((ok) => ok, (error) => { errors.push(error); return undefined; });`,
      violations: 0,
    },
    {
      name: "matchesRethrowingErrArm",
      source: `export const a = (value) => getResult(() => value).match((ok) => ok, (error) => { if (!isNotFound(error)) throw error; return undefined; });`,
      violations: 0,
    },
    {
      name: "matchesLoggedErrArm",
      source: `export const a = (value) => getResult(() => value).match((ok) => ok, (error) => { console.error(error); return undefined; });`,
      violations: 0,
    },
    {
      name: "finalizesAfterAwait",
      source: `export const a = async () => { const page = await open(); await read(page); return withFinalizerAsync(() => use(page), () => page.close()); };`,
      violations: 1,
    },
    {
      name: "finalizesBeforeAwait",
      source: `export const a = async () => { const page = await open(); return await withFinalizerAsync(async () => use(await read(page)), () => page.close()); };`,
      violations: 0,
    },
    {
      name: "releasesDestructuredAfterAwait",
      source: `export const a = async () => { const { close, page } = await openParityPage(); await read(page); return withFinalizerAsync(async () => use(page), () => close()); };`,
      violations: 1,
    },
    {
      name: "releasesGatheredBinding",
      source: `export const a = async () => { const [{ close, page }, size] = await Promise.all([openParityPage(), metadata()]); return withFinalizerAsync(async () => use(page, size), () => close()); };`,
      violations: 1,
    },
    // An await in a nested function runs when that function is called, not between the binding and the finalizer.
    {
      name: "awaitsInNestedFunction",
      source: `export const a = async () => { const page = await open(); const later = async () => await read(page); return withFinalizerAsync(() => later(), () => page.close()); };`,
      violations: 0,
    },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "errorHandling", rules: [RULE, FALLBACK_RULE, FINALIZER_RULE] });
});
