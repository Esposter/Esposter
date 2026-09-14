import { getLanguage } from "@/services/codemirror/getLanguage";
import { describe, expect, test } from "vitest";

describe(getLanguage, () => {
  // `c++` is a real extension, so its punctuation has to reach the pattern escaped — unescaped it would read
  // As "one or more c" and claim every `.cc` file for C++ before the language that owns it is reached
  test.each([
    ["a.ts", "TypeScript"],
    ["a.vue", "Vue"],
    ["a.c++", "C++"],
    ["a.cmake.in", "CMake"],
  ])("reads %s as %s", (filename, language) => {
    expect.hasAssertions();

    expect(getLanguage(filename)).toBe(language);
  });

  // A name the pattern anchors against rather than searches for: the extension has to end the filename, and
  // The dot before it has to be there. The trailing dot is what an extensionless dialect's empty alternation
  // Would claim, ahead of every language that names a real extension
  test.each(["a.unknownextension", "ats", "a.ts.bak", "a."])("reads %s as no language", (filename) => {
    expect.hasAssertions();

    expect(getLanguage(filename)).toBeUndefined();
  });
});
