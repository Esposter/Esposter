import { assertCheckoutIsDisposable } from "#src/services/review/git/assertCheckoutIsDisposable";
import { QUEUE_BRANCH } from "#src/services/shared/constants";
import { FIXTURE_TEST_TIMEOUT_MS } from "#src/services/shared/fixtureConstants.test";
import { setupFixtureRepository } from "#src/services/shared/setupFixtureRepository.test";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(assertCheckoutIsDisposable, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const PATH = "README.md";
  const { commitFile, getCwd, publish } = setupFixtureRepository();

  test("passes a checkout level with the queue", () => {
    expect.hasAssertions();

    commitFile(PATH, "base");
    publish(QUEUE_BRANCH, "HEAD");

    expect(() => assertCheckoutIsDisposable(getCwd())).not.toThrow();
  });

  test("refuses a checkout holding an edit", () => {
    expect.hasAssertions();

    commitFile(PATH, "base");
    publish(QUEUE_BRANCH, "HEAD");
    writeFileSync(join(getCwd(), PATH), "edit");

    expect(() => assertCheckoutIsDisposable(getCwd())).toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Delete, name: assertCheckoutIsDisposable, The review resets this checkout to the queue's tip, which would discard:
      M README.md
      Run it from a checkout of its own.]
    `);
  });

  test("refuses a checkout holding an unpushed commit", () => {
    expect.hasAssertions();

    commitFile(PATH, "base");
    publish(QUEUE_BRANCH, "HEAD");
    commitFile(PATH, "unpushed");

    expect(() => assertCheckoutIsDisposable(getCwd())).toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Delete, name: assertCheckoutIsDisposable, The review resets this checkout to the queue's tip, which would discard:
      6251999 README.md
      Run it from a checkout of its own.]
    `);
  });
});
