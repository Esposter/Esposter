import { checkIsSubstitutionExact } from "#src/services/coderabbit/exclusions/checkIsSubstitutionExact";
import { describe, expect, test } from "vitest";

describe(checkIsSubstitutionExact, () => {
  const substitutions = [{ newName: "NewName", oldName: "OldName" }];

  test("accepts a blob the substitution alone reproduces", () => {
    expect.hasAssertions();

    expect(
      checkIsSubstitutionExact(
        'import { OldName } from "./OldName";\nexport const x = OldName.value;\n',
        'import { NewName } from "./NewName";\nexport const x = NewName.value;\n',
        substitutions,
      ),
    ).toBe(true);
  });

  test("rejects a balanced logic edit riding alongside the rename", () => {
    expect.hasAssertions();

    expect(
      checkIsSubstitutionExact("const a = OldName.value + 1;\n", "const a = NewName.value + 2;\n", substitutions),
    ).toBe(false);
  });

  test("leaves a longer identifier the old name is a prefix of alone", () => {
    expect.hasAssertions();

    expect(checkIsSubstitutionExact("OldNameMap\n", "NewNameMap\n", substitutions)).toBe(false);
  });
});
