import { glob, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import type { Expression, Node, ObjectBindingPattern, SourceFile } from "tsrs/ast";
import type { Project, Type } from "tsrs/sync";

import {
  isIdentifier,
  isObjectBindingPattern,
  isParameterDeclaration,
  isStringLiteral,
  isVariableDeclaration,
} from "tsrs/ast/is";
import { createFileSystemLayer } from "tsrs/fs";
import { API } from "tsrs/sync";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { parse } from "vue/compiler-sfc";

// A `.vue` file is checked as its script blocks, with the rest of the SFC blanked so every line keeps its number. The
// Text is split by code unit, since Vue's block offsets index the string that way
const toVueScanText = (text: string) => {
  const { descriptor } = parse(text);
  const blocks = [descriptor.script, descriptor.scriptSetup].flatMap((block) => (block ? [block] : []));
  const isScript = (offset: number) => blocks.some(({ loc }) => offset >= loc.start.offset && offset < loc.end.offset);
  return text
    .split("")
    .map((character, offset) => (isScript(offset) || character === "\n" ? character : " "))
    .join("");
};

const isFixture = (file: string) => file.startsWith("app/storeRefDestructure.fixture.");

// A store's ref or computed destructured straight off the store is a snapshot: the binding keeps the value it had when
// The destructure ran, and a later write to the store is not seen. `const { customEmojis } = roomEmojiStore` and
// `const { skinTone } = emojiPickerStore` are the same syntax, and the lint sees only that syntax. Which one loses
// Reactivity is a fact about the member's type, so this suite asks the checker: Pinia's `Store` keeps the setup's raw
// Member types as its type arguments, a getter in G and a state member in S, and only a Ref-typed member is a snapshot.
// A plain value (a frozen position, a `markRaw` grid) and a method are read by destructure on purpose, so they pass.
// The checker is the only test here that can tell them apart, which is why this is a test and not a lint rule.
describe("storeRefDestructure", () => {
  const WEB_ROOT = join(import.meta.dirname, "..");
  const APP_ROOT = join(WEB_ROOT, "app");
  const VUE_SCAN_SUFFIX = ".scan.ts";
  const FIXTURE_PATH = join(APP_ROOT, "storeRefDestructure.fixture.ts");
  const FIXTURE_VUE_PATH = join(APP_ROOT, "storeRefDestructure.fixture.vue");
  const REF_TYPE_PATTERN = /^(?:Shallow|Removable|Writable)?(?:Computed)?Ref</u;
  // A destructure of a store is in a file that imports or calls a `use*Store`, so only those files are scanned
  const STORE_USE_PATTERN = /\buse\w+Store\b/u;
  // The fixtures are written as virtual files in the project, so the checker types them against the real stores
  const FIXTURE_TEXT = `import { useEmojiPickerStore } from "#src/store/message/emojiPicker";
import { useMonsterPartySceneStore } from "#src/store/dungeons/monsterParty/scene";
import { useRoomEmojiStore } from "#src/store/message/room/emoji";

export const destructuresGetter = () => {
  const roomEmojiStore = useRoomEmojiStore();
  const { customEmojis } = roomEmojiStore;
  return customEmojis;
};
export const destructuresStateRef = () => {
  const emojiPickerStore = useEmojiPickerStore();
  const { skinTone } = emojiPickerStore;
  return skinTone;
};
export const destructuresMethod = () => {
  const roomEmojiStore = useRoomEmojiStore();
  const { readRoomEmojis } = roomEmojiStore;
  return readRoomEmojis;
};
export const destructuresPlainValue = () => {
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const { monsterPartyOptionGrid } = monsterPartySceneStore;
  return monsterPartyOptionGrid;
};
export const destructuresThroughStoreToRefs = () => {
  const { customEmojis } = storeToRefs(useRoomEmojiStore());
  return customEmojis.value;
};
`;
  // A component's script is the same scan as a script file's, so a `.vue` file gets a seeded hit of its own
  const FIXTURE_VUE_TEXT = `<script setup lang="ts">
import { useRoomEmojiStore } from "#src/store/message/room/emoji";

const { customEmojis } = useRoomEmojiStore();
</script>
`;

  interface StoreHit {
    file: string;
    kind: string;
    line: number;
    prop: string;
  }

  const toSourcePath = (fileName: string) =>
    fileName.endsWith(VUE_SCAN_SUFFIX) ? fileName.slice(0, -VUE_SCAN_SUFFIX.length) : fileName;

  const readStoreSources = async () => {
    const sourcePaths = (await Array.fromAsync(glob(["app/**/*.{ts,vue}"], { cwd: WEB_ROOT })))
      .map((sourcePath) => join(WEB_ROOT, sourcePath))
      .filter((sourcePath) => !sourcePath.endsWith(".d.ts"));
    const sources = await Promise.all(
      sourcePaths.map(async (sourcePath): Promise<[string, string]> => {
        const text = await readFile(sourcePath, "utf8");
        return [sourcePath, sourcePath.endsWith(".vue") ? toVueScanText(text) : text];
      }),
    );
    const selected = sources.filter(([, scanText]) => STORE_USE_PATTERN.test(scanText));
    return {
      scriptPaths: selected.map(([sourcePath]) => sourcePath).filter((sourcePath) => sourcePath.endsWith(".ts")),
      vueScanEntries: selected
        .filter(([sourcePath]) => sourcePath.endsWith(".vue"))
        .map(([sourcePath, scanText]): [string, string] => [`${sourcePath}${VUE_SCAN_SUFFIX}`, scanText]),
    };
  };

  // The project is the app's own tsconfig, extended by a virtual one that adds the fixtures and the `.vue` scan texts as
  // Files. They live in a layer over the disk, so the checker types them against the real stores and Nuxt's globals
  const openStoreProject = (api: API, virtualSources: Map<string, string>) => {
    const configurationPath = join(WEB_ROOT, "storeRefDestructure.tsconfig.json");
    const configurationText = JSON.stringify({
      extends: "./.nuxt/tsconfig.app.json",
      files: [...virtualSources.keys()],
    });
    const snapshot = api.createSnapshot({
      fileSystem: createFileSystemLayer([[configurationPath, configurationText], ...virtualSources]),
      openProjects: [configurationPath],
    });
    const project = snapshot.getConfiguredProject(configurationPath);
    if (!project) throw new Error(`No project opened for ${configurationPath}`);
    return project;
  };

  const scanStoreDestructures = ({ checker, program }: Project, scannedPaths: string[]) => {
    const hits: StoreHit[] = [];
    const isStoreType = (type: Type) =>
      checker.getPropertyOfType(type, "$id") !== undefined && checker.getPropertyOfType(type, "$state") !== undefined;
    const isRefLike = (type: Type) => REF_TYPE_PATTERN.test(checker.typeToString(type));
    const report = (sourceFile: SourceFile, node: Node, kind: string, prop: string) => {
      hits.push({
        file: relative(WEB_ROOT, toSourcePath(sourceFile.fileName)),
        kind,
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
        prop,
      });
    };
    const scanPattern = (sourceFile: SourceFile, pattern: ObjectBindingPattern, initializer: Expression) => {
      const initializerType = checker.getTypeAtLocation(initializer);
      if (!initializerType || !isStoreType(initializerType)) return;

      // Pinia's `Store<Id, S, G, A>` keeps the raw member types the setup returned as its type arguments
      const [, stateType, getterType] = initializerType.getAliasTypeArguments();
      for (const element of pattern.elements) {
        if (element.dotDotDotToken) {
          report(sourceFile, element, "rest", "...");
          continue;
        }
        const name = element.propertyName ?? element.name;
        const propName = isIdentifier(name) || isStringLiteral(name) ? name.text : undefined;
        if (propName === undefined) continue;
        const property = checker.getPropertyOfType(initializerType, propName);
        if (!property) {
          report(sourceFile, element, "unresolved", propName);
          continue;
        }
        if (checker.getTypeOfSymbolAtLocation(property, element)?.getCallSignatures().length) continue;

        const getter = getterType && checker.getPropertyOfType(getterType, propName);
        const state = stateType && checker.getPropertyOfType(stateType, propName);
        const getterMemberType = getter && checker.getTypeOfSymbolAtLocation(getter, element);
        const stateMemberType = state && checker.getTypeOfSymbolAtLocation(state, element);
        if (getterMemberType && isRefLike(getterMemberType)) report(sourceFile, element, "getter", propName);
        else if (stateMemberType && isRefLike(stateMemberType)) report(sourceFile, element, "ref", propName);
      }
    };
    const visit = (sourceFile: SourceFile, node: Node): void => {
      if (
        (isVariableDeclaration(node) || isParameterDeclaration(node)) &&
        isObjectBindingPattern(node.name) &&
        node.initializer
      )
        scanPattern(sourceFile, node.name, node.initializer);
      node.forEachChild((child) => {
        visit(sourceFile, child);
      });
    };

    for (const scannedPath of scannedPaths) {
      const sourceFile = program.getSourceFile(scannedPath);
      if (!sourceFile) throw new Error(`${scannedPath} is not in the program`);
      visit(sourceFile, sourceFile);
    }
    return hits;
  };

  let hits: StoreHit[] = [];

  const api = new API({ cwd: WEB_ROOT });

  beforeAll(async () => {
    const { scriptPaths, vueScanEntries } = await readStoreSources();
    const fixtureVueScanPath = `${FIXTURE_VUE_PATH}${VUE_SCAN_SUFFIX}`;
    const project = openStoreProject(
      api,
      new Map([...vueScanEntries, [fixtureVueScanPath, toVueScanText(FIXTURE_VUE_TEXT)], [FIXTURE_PATH, FIXTURE_TEXT]]),
    );
    hits = scanStoreDestructures(project, [
      ...scriptPaths,
      ...vueScanEntries.map(([scanPath]) => scanPath),
      fixtureVueScanPath,
      FIXTURE_PATH,
    ]);
  });

  afterAll(() => {
    api.close();
  });

  test("destructures no store ref or computed off a store as a snapshot", () => {
    expect.hasAssertions();

    expect(hits.filter(({ file }) => !isFixture(file))).toStrictEqual([]);
  });

  test("reports a getter and a state ref destructured off a store, in a script and in a component, and passes a method, a plain value and storeToRefs", () => {
    expect.hasAssertions();

    expect(
      hits.filter(({ file }) => file === relative(WEB_ROOT, FIXTURE_PATH)).map(({ kind, prop }) => ({ kind, prop })),
    ).toStrictEqual([
      { kind: "getter", prop: "customEmojis" },
      { kind: "ref", prop: "skinTone" },
    ]);
    expect(
      hits
        .filter(({ file }) => file === relative(WEB_ROOT, FIXTURE_VUE_PATH))
        .map(({ kind, prop }) => ({ kind, prop })),
    ).toStrictEqual([{ kind: "getter", prop: "customEmojis" }]);
  });
});
