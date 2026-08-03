import { describe, expect, test } from "vitest";

import { AREA_ARGS, AREA_SCOPE } from "./constants.test";
import { createAreaFiles } from "./createAreaFiles.test";
import { createSeam } from "./createSeam.test";
import { getPrompt } from "./getPrompt.test";
import { runReview } from "./runReview.test";
import { stubFor } from "./stubFor.test";

// The claim inventory is what an area review checks the code against, so every rule here protects one number:
// How much of the record the run actually audited. Overstating it is the failure mode, in both directions —
// A claim counted but never shown, and a correct docs page reported as wrong because nobody could read its code.
describe("code-review claims", () => {
  const createClaim = (claim: string, pathPrefixes?: string[]) => ({ claim, pathPrefixes, source: "docs/cache.md" });
  const SINGLE_FLIGHT = "reads are single-flight";

  test("drops a claim that is missing its source", async () => {
    expect.hasAssertions();

    const claims = [createClaim(SINGLE_FLIGHT), { claim: "orphan" }];
    const run = await runReview(AREA_ARGS, stubFor({ scope: { ...AREA_SCOPE, claims } }));

    expect(run.result.stats?.claimsInventoried).toBe(1);
  });

  test("keeps a claim whose prefixes resolve to nothing when the file cap never fired", async () => {
    expect.hasAssertions();

    const claims = [createClaim(SINGLE_FLIGHT, ["cache/**/*.ts"])];
    const run = await runReview(AREA_ARGS, stubFor({ scope: { ...AREA_SCOPE, claims } }));

    expect(run.result.stats).toMatchObject({ claimsChecked: 1, claimsInventoried: 1 });
  });

  test("keeps a glob-prefixed claim on a capped run too", async () => {
    expect.hasAssertions();

    // The cap may only drop what the cap made unresolvable. A glob resolved to nothing before it fired, so
    // Dropping it there blames a coverage gap on a size problem and sends the user to narrow the wrong thing.
    const claims = [createClaim(SINGLE_FLIGHT, ["cache/**/*.ts"])];
    const run = await runReview(AREA_ARGS, stubFor({ scope: { ...AREA_SCOPE, claims, files: createAreaFiles(200) } }));

    expect(run.result.stats).toMatchObject({ claimsChecked: 1, claimsInventoried: 1 });
  });

  test("drops a claim whose files the cap removed, and says the cap did it", async () => {
    expect.hasAssertions();

    const claims = [createClaim("the tail file is documented", ["cache/f199.ts"])];
    const run = await runReview(AREA_ARGS, stubFor({ scope: { ...AREA_SCOPE, claims, files: createAreaFiles(200) } }));

    expect(run.logs).toContainEqual(expect.stringContaining("the file cap removed every file they describe"));
    expect(run.result.stats).toMatchObject({ claimsChecked: 0, claimsInventoried: 1 });
  });

  test("attaches a claim to its own seam and not to a sibling it merely prefixes", async () => {
    expect.hasAssertions();

    const run = await runReview(
      AREA_ARGS,
      stubFor({
        scope: {
          ...AREA_SCOPE,
          claims: [createClaim("drafts persist on blur", ["app/messageDraft"])],
          files: ["app/message/a.ts", "app/messageDraft/b.ts", ...createAreaFiles()],
          seams: [createSeam("message", ["app/message"]), createSeam("drafts", ["app/messageDraft"])],
        },
      }),
    );

    expect(getPrompt(run, "seam:drafts")).toContain("drafts persist on blur");
    expect(getPrompt(run, "seam:message")).not.toContain("drafts persist on blur");
  });

  test("tells a seam that owns no claim so, instead of handing it the whole inventory", async () => {
    expect.hasAssertions();

    const run = await runReview(
      AREA_ARGS,
      stubFor({
        scope: {
          ...AREA_SCOPE,
          claims: [createClaim(SINGLE_FLIGHT, ["cache/f1.ts"])],
          files: createAreaFiles(),
          seams: [createSeam("reads", ["cache/f1.ts"]), createSeam("writes", ["cache/f2.ts"])],
        },
      }),
    );

    expect(getPrompt(run, "seam:writes")).toContain("documents this territory");
    expect(getPrompt(run, "seam:writes")).not.toContain(SINGLE_FLIGHT);
  });

  test("counts a claim as checked only when its finder returned", async () => {
    expect.hasAssertions();

    const scope = { ...AREA_SCOPE, claims: [createClaim(SINGLE_FLIGHT)] };
    const base = stubFor({ scope });
    const run = await runReview(AREA_ARGS, (prompt, options) =>
      options.label === "conformance" ? null : base(prompt, options),
    );

    expect(run.result.stats).toMatchObject({ claimsChecked: 0, claimsInventoried: 1 });
  });

  test("builds a conformance finder only when the record said something", async () => {
    expect.hasAssertions();

    const withClaims = await runReview(
      AREA_ARGS,
      stubFor({ scope: { ...AREA_SCOPE, claims: [createClaim(SINGLE_FLIGHT)] } }),
    );
    const without = await runReview(AREA_ARGS, stubFor({ scope: AREA_SCOPE }));

    expect(withClaims.calls.map((call) => call.label)).toContain("conformance");
    expect(without.calls.map((call) => call.label)).not.toContain("conformance");
  });

  test("carries the claim inventory inline into the coverage finder", async () => {
    expect.hasAssertions();

    const run = await runReview(AREA_ARGS, stubFor({ scope: { ...AREA_SCOPE, claims: [createClaim(SINGLE_FLIGHT)] } }));

    expect(getPrompt(run, "coverage")).toContain(SINGLE_FLIGHT);
    expect(getPrompt(run, "coverage")).toContain("docs/cache.md");
  });
});
