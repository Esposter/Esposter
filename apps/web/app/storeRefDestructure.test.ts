import { glob, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import ts from "typescript";
import { beforeAll, describe, expect, test } from "vitest";
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
  const BARREL_PATH = join(APP_ROOT, "storeRefDestructure.barrel.ts");
  const REF_TYPE_PATTERN = /^(?:Shallow|Removable|Writable)?(?:Computed)?Ref</u;
  // The fixture is written as a virtual file in the program, so the checker types it against the real stores
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

  interface StoreHit {
    file: string;
    kind: string;
    line: number;
    prop: string;
  }

  // The sources are read first, since the program is made from them synchronously: a tsgo-backed Program has a `then`
  // That throws, so a function that returns one cannot be async
  const readStoreSources = async (virtualFiles: Map<string, string>) => {
    const sourcePaths = (await Array.fromAsync(glob(["app/**/*.{ts,vue}"], { cwd: WEB_ROOT })))
      .map((sourcePath) => join(WEB_ROOT, sourcePath))
      .filter((sourcePath) => !sourcePath.endsWith(".d.ts"));
    const vueScanEntries = await Promise.all(
      sourcePaths
        .filter((sourcePath) => sourcePath.endsWith(".vue"))
        .map(async (sourcePath): Promise<[string, string]> => [
          `${sourcePath}${VUE_SCAN_SUFFIX}`,
          toVueScanText(await readFile(sourcePath, "utf8")),
        ]),
    );
    return {
      scriptPaths: sourcePaths.filter((sourcePath) => sourcePath.endsWith(".ts")),
      vueScanFiles: new Map([...vueScanEntries, ...virtualFiles]),
    };
  };

  const createStoreProgram = (scriptPaths: string[], vueScanFiles: Map<string, string>) => {
    const { config } = ts.readConfigFile(join(WEB_ROOT, ".nuxt/tsconfig.app.json"), ts.sys.readFile);
    const configuration = ts.parseJsonConfigFileContent(config, ts.sys, WEB_ROOT);

    // The barrel imports every app file. The checker leaves the syntax tree of a root file empty and fills one the Program
    // Reaches through an import, so a scan that listed the app files as roots would read nothing in them
    const barrelText = scriptPaths
      .map((scriptPath) => `import "./${relative(APP_ROOT, scriptPath).replaceAll(sep, "/").replace(/\.ts$/u, "")}";`)
      .join("\n");
    const virtualFiles = new Map([...vueScanFiles, [BARREL_PATH, barrelText]]);

    // Nuxt's global declarations are what make `storeToRefs` and the store composables resolve without an import
    const rootNames = [
      ...configuration.fileNames,
      ...ts.sys.readDirectory(join(WEB_ROOT, ".nuxt/types"), [".d.ts"]),
      ...ts.sys.readDirectory(join(WEB_ROOT, ".nuxt"), [".d.ts"], undefined, undefined, 1),
      ...virtualFiles.keys(),
    ];

    const host = ts.createCompilerHost(configuration.options);
    const getSourceFile = host.getSourceFile.bind(host);
    host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
      const virtualText = virtualFiles.get(fileName);
      if (virtualText !== undefined)
        return ts.createSourceFile(fileName, virtualText, languageVersion, true, ts.ScriptKind.TS);
      return getSourceFile(fileName, languageVersion, onError, shouldCreate);
    };
    const fileExists = host.fileExists.bind(host);
    host.fileExists = (fileName) => virtualFiles.has(fileName) || fileExists(fileName);
    const readFileText = host.readFile.bind(host);
    host.readFile = (fileName) => virtualFiles.get(fileName) ?? readFileText(fileName);

    return ts.createProgram({ host, options: configuration.options, rootNames: [...new Set(rootNames)] });
  };

  const scanStoreDestructures = (program: ts.Program) => {
    const checker = program.getTypeChecker();
    const hits: StoreHit[] = [];
    const isStoreType = (type: ts.Type) =>
      checker.getPropertyOfType(type, "$id") !== undefined && checker.getPropertyOfType(type, "$state") !== undefined;
    const isRefLike = (type: ts.Type) => REF_TYPE_PATTERN.test(checker.typeToString(type));
    const report = (sourceFile: ts.SourceFile, node: ts.Node, kind: string, prop: string) => {
      const fileName = sourceFile.fileName.endsWith(VUE_SCAN_SUFFIX)
        ? sourceFile.fileName.slice(0, -VUE_SCAN_SUFFIX.length)
        : sourceFile.fileName;
      hits.push({
        file: relative(WEB_ROOT, fileName),
        kind,
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
        prop,
      });
    };
    const scanPattern = (sourceFile: ts.SourceFile, pattern: ts.ObjectBindingPattern, initializer: ts.Expression) => {
      const initializerType = checker.getTypeAtLocation(initializer);
      if (!isStoreType(initializerType)) return;

      // Pinia's `Store<Id, S, G, A>` keeps the raw member types the setup returned as its type arguments
      const [, stateType, getterType] = initializerType.aliasTypeArguments ?? [];
      for (const element of pattern.elements) {
        if (element.dotDotDotToken) {
          report(sourceFile, element, "rest", "...");
          continue;
        }
        const name = element.propertyName ?? element.name;
        const propName = ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : undefined;
        if (propName === undefined) continue;
        const property = checker.getPropertyOfType(initializerType, propName);
        if (!property) {
          report(sourceFile, element, "unresolved", propName);
          continue;
        }
        if (checker.getTypeOfSymbolAtLocation(property, element).getCallSignatures().length > 0) continue;

        const getter = getterType && checker.getPropertyOfType(getterType, propName);
        const state = stateType && checker.getPropertyOfType(stateType, propName);
        if (getter && isRefLike(checker.getTypeOfSymbolAtLocation(getter, element)))
          report(sourceFile, element, "getter", propName);
        else if (state && isRefLike(checker.getTypeOfSymbolAtLocation(state, element)))
          report(sourceFile, element, "ref", propName);
      }
    };
    const visit = (sourceFile: ts.SourceFile, node: ts.Node): void => {
      if (
        (ts.isVariableDeclaration(node) || ts.isParameter(node)) &&
        ts.isObjectBindingPattern(node.name) &&
        node.initializer
      )
        scanPattern(sourceFile, node.name, node.initializer);
      ts.forEachChild(node, (child) => {
        visit(sourceFile, child);
      });
    };

    for (const sourceFile of program.getSourceFiles())
      if (sourceFile.fileName.startsWith(APP_ROOT) && !sourceFile.isDeclarationFile) visit(sourceFile, sourceFile);
    return hits;
  };

  // A file with text and no syntax tree gives the scan above nothing to find, so it is named here rather than passing. A
  // `.vue` file with no script block blanks to nothing, so it has no tree to read and is not one
  const listUnreadAppFiles = (program: ts.Program) =>
    program
      .getSourceFiles()
      .filter(
        (sourceFile) =>
          sourceFile.fileName.startsWith(APP_ROOT) &&
          !sourceFile.isDeclarationFile &&
          sourceFile.statements.length === 0 &&
          sourceFile.text.trim() !== "",
      )
      .map((sourceFile) => relative(WEB_ROOT, sourceFile.fileName));

  let hits: StoreHit[] = [];
  let unreadFiles: string[] = [];

  beforeAll(async () => {
    const { scriptPaths, vueScanFiles } = await readStoreSources(new Map([[FIXTURE_PATH, FIXTURE_TEXT]]));
    const program = createStoreProgram(scriptPaths, vueScanFiles);
    hits = scanStoreDestructures(program);
    unreadFiles = listUnreadAppFiles(program);
  });

  test("destructures no store ref or computed off a store as a snapshot", () => {
    expect.hasAssertions();

    expect(hits.filter(({ file }) => file !== relative(WEB_ROOT, FIXTURE_PATH))).toStrictEqual([]);
  });

  test("reports a getter and a state ref destructured off a store, and passes a method, a plain value and storeToRefs", () => {
    expect.hasAssertions();

    expect(
      hits.filter(({ file }) => file === relative(WEB_ROOT, FIXTURE_PATH)).map(({ kind, prop }) => ({ kind, prop })),
    ).toStrictEqual([
      { kind: "getter", prop: "customEmojis" },
      { kind: "ref", prop: "skinTone" },
    ]);
  });

  test("reads the syntax tree of every app source file, so the scan above cannot pass by reading nothing", () => {
    expect.hasAssertions();

    expect(unreadFiles).toStrictEqual([]);
  });
});
