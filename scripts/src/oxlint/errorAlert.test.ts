import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("errorAlert", () => {
  const CALLEE = "createAlert";
  const PROPERTY = "message";
  const CREATE_ERROR_ALERT = "createErrorAlert";
  const RULE = "error-alert/no-raw-error-alert";
  const FIXTURES = [
    { name: "alertsErrorMessage", source: `${CALLEE}(a.${PROPERTY}, "b");`, violations: 1 },
    // The shape a `.match` err handler writes, which is where every real instance was found.
    {
      name: "alertsErrorMessageInHandler",
      source: `g(f).match(h, (a) => { ${CALLEE}(a.${PROPERTY}, "b"); });`,
      violations: 1,
    },
    // A rejection reached through the object holding it is the same rejection.
    { name: "alertsNestedErrorMessage", source: `${CALLEE}(a.b.${PROPERTY}, "b");`, violations: 1 },
    // Everything below is a sentence the caller composed, so no error is being routed anywhere.
    { name: "alertsStringLiteral", source: `${CALLEE}("a", "b");`, violations: 0 },
    { name: "alertsTemplateLiteral", source: `${CALLEE}(\`\${a.b}: \${c.${PROPERTY}}\`, "b");`, violations: 0 },
    { name: "alertsOtherProperty", source: `${CALLEE}(a.b, "b");`, violations: 0 },
    // A computed read is not the `.message` property this rule is about.
    { name: "alertsComputedProperty", source: `${CALLEE}(a[b], "b");`, violations: 0 },
    // The sanctioned caller-side alert, which is what every reported site is meant to become.
    { name: "callsCreateErrorAlert", source: `${CREATE_ERROR_ALERT}(a);`, violations: 0 },
    // A different callee reading `.message` is not the alert store.
    { name: "logsErrorMessage", source: `console.error(a.${PROPERTY});`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "errorAlert", rules: [RULE] });
});
