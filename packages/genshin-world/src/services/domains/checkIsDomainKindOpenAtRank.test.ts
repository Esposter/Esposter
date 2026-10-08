import { DomainKind } from "#src/models/domains/DomainKind";
import { checkIsDomainKindOpenAtRank } from "#src/services/domains/checkIsDomainKindOpenAtRank";
import { describe, expect, test } from "vitest";

describe(checkIsDomainKindOpenAtRank, () => {
  test("a Domain of Forgery opens at Adventure Rank 16, one rank short of it still closed", () => {
    expect.hasAssertions();

    expect(checkIsDomainKindOpenAtRank(DomainKind.Forgery, 15)).toBe(false);
    expect(checkIsDomainKindOpenAtRank(DomainKind.Forgery, 16)).toBe(true);
  });

  test("a Domain of Blessing and a Domain of Mastery each open at their own rank", () => {
    expect.hasAssertions();

    expect(checkIsDomainKindOpenAtRank(DomainKind.Blessing, 21)).toBe(false);
    expect(checkIsDomainKindOpenAtRank(DomainKind.Blessing, 22)).toBe(true);
    expect(checkIsDomainKindOpenAtRank(DomainKind.Mastery, 26)).toBe(false);
    expect(checkIsDomainKindOpenAtRank(DomainKind.Mastery, 27)).toBe(true);
  });
});
