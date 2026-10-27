import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("routing", () => {
  // oxlint-disable-next-line routing/no-route-literal -- the fixture spells the route segment the rule reports
  const SEGMENT = "/calls";
  const RULE = "routing/no-route-literal";
  const FIXTURES = [
    { name: "pathLiteral", source: `export const a ="/genshin";`, violations: 1 },
    { name: "pathTemplate", source: `export const a =\`/genshin\`;`, violations: 1 },
    { name: "addressOfPath", source: `export const b = "https://a.com/genshin";`, violations: 1 },
    { name: "addressOfPathTemplate", source: `export const b = \`https://a.com/genshin\`;`, violations: 1 },
    // A longer path holding a route's name is a page of its own
    { name: "longerPath", source: `export const a ="/a/genshin";`, violations: 0 },
    // The root is a separator as often as a page, and a path no route names is not a copy of one
    { name: "root", source: `export const a ="/";`, violations: 0 },
    { name: "unknownPath", source: `export const a ="/a";`, violations: 0 },
    { name: "segmentAfterPath", source: `export const a = \`\${a}${SEGMENT}\`;`, violations: 0 },
    { name: "routePath", source: `export const b = \`https://a.com\${a.b}\`;`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "routing", rules: [RULE] });
});
