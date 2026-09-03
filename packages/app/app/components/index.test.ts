import { glob } from "node:fs/promises";
import { basename } from "node:path";
import { describe, expect, test } from "vitest";

const componentPaths = (await Array.fromAsync(glob("**/*.vue", { cwd: import.meta.dirname }))).map((componentPath) =>
  componentPath.replaceAll("\\", "/"),
);
// Every folder that holds a component, keyed by the folder it sits in. Derived from the component paths rather
// Than read separately, because a folder with no component in it has nothing to fold into
const parentFolderNamesMap = componentPaths.reduce<Map<string, Set<string>>>((folderNames, componentPath) => {
  const segments = componentPath.split("/").slice(0, -1);
  for (const [index, segment] of segments.entries()) {
    const parent = segments.slice(0, index).join("/");
    folderNames.set(parent, (folderNames.get(parent) ?? new Set()).add(segment));
  }
  return folderNames;
}, new Map());

// The other half of the rule — folding a prefix group out of a crowded directory — is a judgement call, because
// A shared first word can belong to a suffix family that folding would scatter. This half never is: a file whose
// Leading words spell a folder standing beside it is a stray from that folder, and moving it in is a pure move,
// Since the folder re-supplies the word and the generated component name does not change
// (`.agents/skills/vue-component-patterns/references/component-naming.md`)
describe("componentFolders", () => {
  const WORD_REGEX = /[A-Z][a-z0-9]*|[A-Z]+(?![a-z])/gu;

  test("holds no component beside the folder its own name opens with", () => {
    expect.hasAssertions();

    const strays = componentPaths.flatMap((componentPath) => {
      const segments = componentPath.split("/");
      const parent = segments.slice(0, -1).join("/");
      const words = basename(componentPath, ".vue").match(WORD_REGEX) ?? [];
      // Longest run first, so a file beside both `Foo/` and `FooBar/` is folded into the deeper of the two
      const folderName = words
        .slice(0, -1)
        .map((word, index) => words.slice(0, index).join("") + word)
        .toReversed()
        .find((prefix) => parentFolderNamesMap.get(parent)?.has(prefix));
      return folderName ? [`${componentPath} belongs in ${parent}/${folderName}/`] : [];
    });

    expect(strays).toStrictEqual([]);
  });
});
