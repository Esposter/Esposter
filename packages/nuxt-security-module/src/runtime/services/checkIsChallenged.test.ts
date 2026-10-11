import { checkIsChallenged } from "#src/runtime/services/checkIsChallenged";
import { describe, expect, test } from "vitest";

describe(checkIsChallenged, () => {
  const OPTIONS = { name: "user", pass: "pass" };

  test("#266 every listed include path is protected, not only the first", () => {
    expect.hasAssertions();

    const options = { ...OPTIONS, exclude: ["/b"], include: ["/a", "/b/private"] };
    expect(checkIsChallenged("/b/private/page", options)).toBe(true);
  });

  test("#266 a path an exclude matches and no include matches is not challenged", () => {
    expect.hasAssertions();

    const options = { ...OPTIONS, exclude: ["/b"], include: ["/a", "/b/private"] };
    expect(checkIsChallenged("/b/public", options)).toBe(false);
  });

  test("a path no exclude matches is challenged", () => {
    expect.hasAssertions();

    expect(checkIsChallenged("/anything", OPTIONS)).toBe(true);
  });
});
