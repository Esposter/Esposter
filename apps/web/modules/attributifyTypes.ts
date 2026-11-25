import type { UnoGenerator } from "unocss";

import unoConfig from "#uno.config";
import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";
import { addTypeTemplate, defineNuxtModule } from "nuxt/kit";
import { createGenerator } from "unocss";
import { camelize } from "vue";

interface Source {
  code: string;
  id: string;
}
// Attributify matches an attribute as `[name=""]` when it is valueless and `[name~="value"]` when it has one, so the
// Name runs up to whichever of the two closes it; a variant's own brackets, as in `data-[state=open]:op`, hold neither
const ATTRIBUTE_SELECTOR_REGEX = /^\[(?<name>.+?)(?:=""|~=")/u;

// Every attribute name the templates use that the app's own UnoCSS config generates CSS for, which is the test the
// Build applies, so a misspelled utility generates nothing and is never declared. Each is given in its kebab and its
// CamelCase spelling, since a component's prop check reads the camelCase one
export const getAttributifyNames = async (generator: UnoGenerator, sources: Source[]) => {
  const tokens = new Set<string>();
  await Promise.all(sources.map(({ code, id }) => generator.applyExtractors(code, id, tokens)));
  const { matched } = await generator.generate(tokens, { preflights: false });
  const names = new Set<string>();
  for (const token of matched) {
    const name = ATTRIBUTE_SELECTOR_REGEX.exec(token)?.groups?.name;
    if (name) names.add(name).add(camelize(name));
  }
  return [...names].toSorted();
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
// The attributify names the templates use, declared for the template check at `nuxt prepare` and under `nuxt dev`, the
// Two that write types something reads. Nothing is committed, so the declaration cannot go stale
export default defineNuxtModule({
  meta: { name: "attributify-types" },
  setup: (_options, nuxt) => {
    // oxlint-disable-next-line no-underscore-dangle -- `_prepare` is Nuxt's own flag for `nuxt prepare`
    if (!nuxt.options._prepare && !nuxt.options.dev) return;
    addTypeTemplate({
      filename: "types/attributify.d.ts",
      getContents: async () => {
        const generator = await createGenerator(unoConfig);
        const paths = await Array.fromAsync(glob("**/*.vue", { cwd: nuxt.options.srcDir }));
        const sources = await Promise.all(
          paths.map(async (id) => ({ code: await readFile(join(nuxt.options.srcDir, id), "utf8"), id })),
        );
        const names = await getAttributifyNames(generator, sources);
        return getAttributifyDeclaration(names);
      },
    });
  },
});
