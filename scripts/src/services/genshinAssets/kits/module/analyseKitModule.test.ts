import { analyseKitModule } from "#src/services/genshinAssets/kits/module/analyseKitModule";
import { createKitModuleProgram } from "#src/services/genshinAssets/kits/module/createKitModuleProgram";
import { createSampleKit } from "#src/services/genshinAssets/kits/module/fixtures/sampleKit";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(analyseKitModule, () => {
  const FIXTURE_FILE = join(import.meta.dirname, "fixtures/sampleKit.ts");

  test("reads each value a behaviour reads from outside itself as a site, a derived binding's reads beside it", () => {
    expect.hasAssertions();

    const program = createKitModuleProgram([FIXTURE_FILE]);
    const { createName, sites } = analyseKitModule(program, FIXTURE_FILE);
    const siteNameMap = new Map(sites.map(({ id, name }) => [id, name]));

    expect(createName).toBe(createSampleKit.name);
    expect(
      sites.map(({ captureKind, derivedSiteId, expressionText, fieldKey, kind, name, parameters }) => ({
        captureKind,
        derivedFrom: derivedSiteId === undefined ? undefined : siteNameMap.get(derivedSiteId),
        expressionText,
        fieldKey,
        kind,
        name,
        parameters,
      })),
    ).toMatchInlineSnapshot(`
      [
        {
          "captureKind": undefined,
          "derivedFrom": undefined,
          "expressionText": "MARK_HITMARK_FRAMES + ECHO_DELAY_FRAMES",
          "fieldKey": undefined,
          "kind": "Frames",
          "name": "echoSeconds",
          "parameters": undefined,
        },
        {
          "captureKind": "Hit",
          "derivedFrom": undefined,
          "expressionText": "markHit",
          "fieldKey": undefined,
          "kind": "Capture",
          "name": "markHit",
          "parameters": undefined,
        },
        {
          "captureKind": "Hit",
          "derivedFrom": undefined,
          "expressionText": "ECHO_HIT_AREA",
          "fieldKey": "hitArea",
          "kind": "Field",
          "name": "echo",
          "parameters": undefined,
        },
        {
          "captureKind": undefined,
          "derivedFrom": undefined,
          "expressionText": "ECHO_POISE_DAMAGE",
          "fieldKey": undefined,
          "kind": "Value",
          "name": "echoPoiseDamage",
          "parameters": undefined,
        },
        {
          "captureKind": "Hit",
          "derivedFrom": undefined,
          "expressionText": "echoMultiplier",
          "fieldKey": "talentMultiplier",
          "kind": "Field",
          "name": "echo",
          "parameters": undefined,
        },
        {
          "captureKind": undefined,
          "derivedFrom": undefined,
          "expressionText": "cooldownShare",
          "fieldKey": undefined,
          "kind": "Value",
          "name": "cooldownShare",
          "parameters": undefined,
        },
        {
          "captureKind": undefined,
          "derivedFrom": "cooldownShare",
          "expressionText": "getSkillShare(2)",
          "fieldKey": undefined,
          "kind": "Talent",
          "name": "cooldownShare",
          "parameters": [
            {
              "index": 2,
              "proudSkillGroupId": 9992,
            },
          ],
        },
      ]
    `);
  });
});
