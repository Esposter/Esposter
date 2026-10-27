import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("errorHandling", () => {
  const CONSTRUCTOR = "Error";
  const INVALID_OPERATION_ERROR = "InvalidOperationError";
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
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "errorHandling", rules: [RULE] });
});
