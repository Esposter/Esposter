import type { UnoGenerator } from "unocss";

import unoConfig from "#uno.config";
import { glob, readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { addTypeTemplate, defineNuxtModule } from "nuxt/kit";
import { createGenerator } from "unocss";
import { camelize } from "vue";

// Attributify matches an attribute as `[name=""]` when it is valueless and `[name~="value"]` when it has one, so the
// Name runs up to whichever of the two closes it; a variant's own brackets, as in `data-[state=open]:op`, hold neither
const ATTRIBUTE_SELECTOR_REGEX = /^\[(?<name>.+?)(?:=""|~=")/u;

// Every attribute name among the templates' tokens that the app's own UnoCSS config generates CSS for, which is the
// Test the build applies, so a misspelled utility generates nothing and is never declared. Each is given in its kebab
// And its camelCase spelling, since a component's prop check reads the camelCase one
export const getAttributifyNames = async (generator: UnoGenerator, tokens: Set<string>) => {
  const { matched } = await generator.generate(tokens, { preflights: false });
  const names = new Set<string>();
  for (const token of matched) {
    const name = ATTRIBUTE_SELECTOR_REGEX.exec(token)?.groups?.name;
    if (name) names.add(name).add(camelize(name));
  }
  return [...names].toSorted();
};
// A reported file may be gone by the time it is read, and a file that is gone holds no tokens, so it is read as empty.
// Any other failure fails the template
const readContents = async (path: string) => {
  const [outcome] = await Promise.allSettled([readFile(path, "utf8")]);
  if (outcome.status === "fulfilled") return outcome.value;
  else if (outcome.reason instanceof Error && "code" in outcome.reason && outcome.reason.code === "ENOENT") return "";
  else throw outcome.reason;
};
// Every template's tokens, kept by file with a count of the files holding each token, so a file's update costs that
// File alone. An update reports whether a token entered or left the whole set, the one case the declaration can move
const createTokenIndex = () => {
  const pathTokensMap = new Map<string, Set<string>>();
  const tokenCountMap = new Map<string, number>();
  return {
    getPaths: () => [...pathTokensMap.keys()],
    getTokens: () => new Set(tokenCountMap.keys()),
    update: (path: string, tokens: Set<string>) => {
      let isChanged = false;
      const previousTokens = pathTokensMap.get(path) ?? new Set<string>();
      for (const token of previousTokens) {
        if (tokens.has(token)) continue;
        const count = (tokenCountMap.get(token) ?? 0) - 1;
        if (count > 0) tokenCountMap.set(token, count);
        else {
          tokenCountMap.delete(token);
          isChanged = true;
        }
      }
      for (const token of tokens) {
        if (previousTokens.has(token)) continue;
        const count = (tokenCountMap.get(token) ?? 0) + 1;
        tokenCountMap.set(token, count);
        if (count === 1) isChanged = true;
      }
      if (tokens.size > 0) pathTokensMap.set(path, tokens);
      else pathTokensMap.delete(path);
      return isChanged;
    },
  };
};
// Typed `unknown`, because `T & unknown` is `T`: a name never narrows a prop a component declares under the same name
const getAttributifyDeclaration = (names: string[]) => `interface AttributifyAttributes {
${names.map((name) => `  ${JSON.stringify(name)}?: unknown;`).join("\n")}
}

declare module "vue" {
  interface AllowedComponentProps extends AttributifyAttributes {}
  interface HTMLAttributes extends AttributifyAttributes {}
  interface SVGAttributes extends AttributifyAttributes {}
}

export {};
`;
// The declaration over every template under a directory, kept incremental because `nuxt dev` regenerates every
// Template on each edit: the first read scans the directory, a later one reads only the files the watcher reported, and
// The declaration is generated again only when a token enters or leaves the set
export const createAttributifyTemplate = (directory: string, generatorPromise: Promise<UnoGenerator>) => {
  const srcDirectory = resolve(directory);
  const tokenIndex = createTokenIndex();
  const dirtyPaths = new Set<string>();
  let isScanNeeded = true;
  let isGenerated = false;
  let contents = "";
  return {
    getContents: async () => {
      const generator = await generatorPromise;
      if (isScanNeeded) {
        isScanNeeded = false;
        for await (const path of glob("**/*.vue", { cwd: srcDirectory })) dirtyPaths.add(resolve(srcDirectory, path));
        // A file the scan no longer finds is read as empty, which takes its tokens out
        for (const path of tokenIndex.getPaths()) dirtyPaths.add(path);
      }
      // The reported paths are taken before the reads, so an edit reported during a read queues its file again
      const paths = [...dirtyPaths];
      dirtyPaths.clear();
      const updates = await Promise.all(
        paths.map(async (path) => {
          const tokens = new Set<string>();
          const text = await readContents(path);
          await generator.applyExtractors(text, relative(srcDirectory, path), tokens);
          return { path, tokens };
        }),
      );
      const changes = updates.map(({ path, tokens }) => tokenIndex.update(path, tokens));
      if (!isGenerated || changes.includes(true)) {
        isGenerated = true;
        contents = getAttributifyDeclaration(await getAttributifyNames(generator, tokenIndex.getTokens()));
      }
      return contents;
    },
    onWatch: (event: string, path: string) => {
      const absolutePath = resolve(srcDirectory, path);
      const relativePath = relative(srcDirectory, absolutePath);
      if (relativePath === ".." || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) return;
      // A directory's own event may stand for files the watcher reports nothing else about
      if (event === "addDir" || event === "unlinkDir") isScanNeeded = true;
      else if (absolutePath.endsWith(".vue")) dirtyPaths.add(absolutePath);
    },
  };
};
// The attributify names the templates use, declared for the template check at `nuxt prepare` and under `nuxt dev`, the
// Two that write types something reads. Nothing is committed, so the declaration cannot go stale
export default defineNuxtModule({
  meta: { name: "attributify-types" },
  setup: (_options, nuxt) => {
    // oxlint-disable-next-line no-underscore-dangle -- `_prepare` is Nuxt's own flag for `nuxt prepare`
    if (!nuxt.options._prepare && !nuxt.options.dev) return;
    const { getContents, onWatch } = createAttributifyTemplate(nuxt.options.srcDir, createGenerator(unoConfig));
    nuxt.hook("builder:watch", onWatch);
    addTypeTemplate({ filename: "types/attributify.d.ts", getContents });
  },
});
