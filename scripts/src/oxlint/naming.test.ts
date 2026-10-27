/* oxlint-disable naming/no-site-name-literal -- the fixtures spell the name out to prove the rule reports it */
import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("naming", () => {
  const VERB_GET = "get";
  const VERB_READ = "read";
  const NAME = "esposter";
  const TITLE = "Esposter";
  const ESCAPED_NAME = String.raw`\u0065sposter`;
  const RULE = "naming/no-call-named-binding";
  const SITE_NAME_RULE = "naming/no-site-name-literal";
  const FIXTURES = [
    { name: "namesBindingAfterMemberCall", source: `export const ${VERB_READ}A = b.${VERB_READ}A();`, violations: 1 },
    {
      name: "namesBindingAfterAwaitedMemberCall",
      source: `export const ${VERB_READ}A = await b.${VERB_READ}A();`,
      violations: 1,
    },
    // An optional call is a `ChainExpression` around the call, so the initialiser has one more node to unwrap.
    {
      name: "namesBindingAfterOptionalMemberCall",
      source: `export const ${VERB_READ}A = b?.${VERB_READ}A();`,
      violations: 1,
    },
    {
      name: "namesBindingAfterAwaitedOptionalMemberCall",
      source: `export const ${VERB_READ}A = await b?.${VERB_READ}A();`,
      violations: 1,
    },
    { name: "namesBindingAfterBareCall", source: `export const ${VERB_GET}A = ${VERB_GET}A();`, violations: 1 },
    // A call named for what it returns has no verb to drop: `file.text()`, `scene.add.sprite(…)`, `Date.now()`.
    { name: "namesBindingAfterNounCall", source: `export const text = await a.text();`, violations: 0 },
    // The value's own name is the fix, so the same call under it is what the rule asks for.
    { name: "namesBindingAfterValue", source: `export const a = b.${VERB_READ}A();`, violations: 0 },
    { name: "namesBindingAfterAwaitedValue", source: `export const a = await ${VERB_READ}A();`, violations: 0 },
    // Only a call can carry the verb: a member read or a bare identifier is another rule's.
    { name: "readsMember", source: `export const ${VERB_READ}A = b.${VERB_READ}A;`, violations: 0 },
    // A destructuring pattern names its fields, not the call.
    { name: "destructuresCall", source: `export const { ${VERB_READ}A } = b.${VERB_READ}A();`, violations: 0 },
    // The product's name spelled out, where a value derives it from `SITE_NAME` and our own text leaves it out
    { name: "spellsSiteName", source: `export const a = "${NAME}-a";`, violations: 1 },
    { name: "spellsSiteNameInTemplate", source: `export const a = \`${TITLE}\`;`, violations: 1 },
    { name: "spellsSiteNameInEscapedTemplate", source: `export const a = \`${ESCAPED_NAME}\`;`, violations: 1 },
    { name: "spellsSiteNameBesideWebAddress", source: `export const a = "${NAME}-a https://a.com";`, violations: 1 },
    {
      name: "spellsSiteNameAfterAnchor",
      source: `export const a = '<a href="https://a.com">${NAME}-a</a>';`,
      violations: 1,
    },
    {
      name: "spellsSiteNameAfterEncodedAnchor",
      source: `export const a = \`<a href=&quot;https://a.com&quot;>${NAME}-a</a>\`;`,
      violations: 1,
    },
    // An address holds the name rather than labelling anything: a workspace package, a web address, the repository
    { name: "importsWorkspacePackage", source: `export { a } from "@${NAME}/a";`, violations: 0 },
    { name: "namesWebAddress", source: `export const a = "https://${NAME}.com";`, violations: 0 },
    { name: "namesRepository", source: `export const a = "${TITLE}/${TITLE}";`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "naming", rules: [RULE, SITE_NAME_RULE] });
});
