import { setupPluginSuite } from "#src/services/oxlint/setupPluginSuite.test";
import { describe } from "vitest";

describe("routing", () => {
  const RULE = "routing/no-route-literal";
  const FIXTURES = [
    { name: "pathLiteral", source: `export const path = "/genshin";`, violations: 1 },
    { name: "pathTemplate", source: "export const path = `/genshin`;", violations: 1 },
    { name: "addressOfPath", source: `export const url = "https://host/genshin";`, violations: 1 },
    { name: "addressOfPathTemplate", source: "export const url = `https://host/genshin`;", violations: 1 },
    // A longer path holding a route's name is a page of its own
    { name: "longerPath", source: `export const path = "/docs/genshin";`, violations: 0 },
    // The root is a separator as often as a page, and a path no route names is not a copy of one
    { name: "root", source: `export const path = "/";`, violations: 0 },
    { name: "unknownPath", source: `export const path = "/nowhere";`, violations: 0 },
    { name: "segmentAfterPath", source: `export const path = \`\${section}/calls\`;`, violations: 0 },
    { name: "routePath", source: `export const url = \`https://host\${RoutePath.Genshin}\`;`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "routing", rules: [RULE] });
});
