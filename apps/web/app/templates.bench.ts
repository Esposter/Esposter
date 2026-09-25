import { walkElements } from "@/walkElements.test";
import unoConfig from "@@/uno.config";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { NodeTypes } from "@vue/compiler-core";
import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createGenerator } from "unocss";
import { describe, test } from "vitest";
import { parse, parseCache } from "vue/compiler-sfc";

// The two costs `templates.test.ts` pays over every template in the app: the parse, and the generator asked which
// Attribute names are utilities
const templateTexts = await Promise.all(
  (await Array.fromAsync(glob("**/*.vue", { cwd: import.meta.dirname }))).map((templatePath) =>
    readFile(join(import.meta.dirname, templatePath), "utf8"),
  ),
);

describe("templates", () => {
  // The parse cache answers a source it has seen, so each iteration clears it to parse what a cold run parses
  test("parse every template", async ({ bench }) => {
    const asts = templateTexts.flatMap((text) => parse(text, { sourceMap: false }).descriptor.template?.ast ?? []);
    await bench.compare(
      bench("with source maps", () => {
        parseCache.clear();
        for (const text of templateTexts) parse(text);
      }),
      bench("without source maps", () => {
        parseCache.clear();
        for (const text of templateTexts) parse(text, { sourceMap: false });
      }),
      bench("walk the parsed templates", () => {
        const elementCounts = asts.map((ast) => {
          let elementCount = 0;
          walkElements(ast, () => {
            elementCount++;
          });
          return elementCount;
        });
        return elementCounts;
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });

  // Every valueless attribute name the templates write, asked of the generator one name at a time and as one set.
  // The generator caches what it has parsed, so each iteration resets that to ask what a cold run asks; a generate
  // Adds the configuration's safelist to the set it is handed, so each is handed a fresh one
  test("generate every attribute name", async ({ bench }) => {
    const uno = await createGenerator(unoConfig);
    const attributeNames = new Set<string>();
    for (const text of templateTexts) {
      const ast = parse(text, { sourceMap: false }).descriptor.template?.ast;
      if (ast)
        walkElements(ast, ({ props }) => {
          for (const prop of props) if (prop.type === NodeTypes.ATTRIBUTE && !prop.value) attributeNames.add(prop.name);
        });
    }
    await bench.compare(
      bench("a generate per name", async () => {
        uno.resetTokenProcessing();
        await Promise.all(
          Array.from(attributeNames, (attributeName) => uno.generate(attributeName, { preflights: false })),
        );
      }),
      bench("one generate over the set", async () => {
        uno.resetTokenProcessing();
        await uno.generate(new Set(attributeNames), { preflights: false });
      }),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 3, warmupIterations: 0 },
    );
  });
});
