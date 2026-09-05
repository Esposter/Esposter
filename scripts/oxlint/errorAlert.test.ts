import { setupPluginSuite } from "#scripts/oxlint/setupPluginSuite.test";
import { describe, expect, test } from "vitest";

const RULE = "error-alert/no-raw-error-alert";

describe(RULE, () => {
  const FIXTURES = [
    { name: "alertsErrorMessage", source: `createAlert(error.message, "error");`, violations: 1 },
    // The shape a `.match` err handler writes, which is where every real instance was found.
    {
      name: "alertsErrorMessageInHandler",
      source: `getResultAsync(f).match(noop, (error) => { createAlert(error.message, "error"); });`,
      violations: 1,
    },
    // A rejection reached through the object holding it is the same rejection.
    { name: "alertsNestedErrorMessage", source: `createAlert(result.error.message, "error");`, violations: 1 },
    // Everything below is a sentence the caller composed, so no error is being routed anywhere.
    { name: "alertsStringLiteral", source: `createAlert("Dataset has no rows to export", "warning");`, violations: 0 },
    {
      name: "alertsTemplateLiteral",
      source: `createAlert(\`\${file.name}: \${result.message}\`, "error");`,
      violations: 0,
    },
    { name: "alertsOtherProperty", source: `createAlert(row.title, "error");`, violations: 0 },
    // A computed read is not the `.message` property this rule is about.
    { name: "alertsComputedProperty", source: `createAlert(error[key], "error");`, violations: 0 },
    // The sanctioned caller-side alert, which is what every reported site is meant to become.
    { name: "callsCreateErrorAlert", source: `createErrorAlert(error);`, violations: 0 },
    // A different callee reading `.message` is not the alert store.
    { name: "logsErrorMessage", source: `console.error(error.message);`, violations: 0 },
  ];
  const { getCodes, getViolations } = setupPluginSuite({
    fixtures: FIXTURES,
    plugin: "errorAlert",
    rules: [RULE],
  });

  test.each(FIXTURES)("reports $violations violation(s) for $name", ({ name, violations }) => {
    expect.hasAssertions();

    expect(getViolations(name)).toBe(violations);
  });

  test("reports nothing but this rule", () => {
    expect.hasAssertions();

    expect([...new Set(getCodes())]).toStrictEqual(["error-alert(no-raw-error-alert)"]);
  });
});
