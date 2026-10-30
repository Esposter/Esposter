import { readFormattedSource } from "#src/services/format/readFormattedSource";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readMainCheckoutRoot } from "#src/services/queue/readMainCheckoutRoot";
import { describe, expect, test } from "vitest";

describe(readFormattedSource, () => {
  test("reads no formatted source for a file type the formatter has no parser for, so a format pass skips it", () => {
    expect.hasAssertions();

    expect(readFormattedSource("apps/web/.env.example", REPOSITORY_ROOT, readMainCheckoutRoot())).toBeUndefined();
  });
});
