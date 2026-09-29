import unoConfiguration from "@@/uno.config";
import { defineCommand, runMain } from "citty";
import { createGenerator } from "unocss";

await runMain(
  defineCommand({
    args: {
      markup: {
        description: "A markup fragment, its utilities as attributes or classes",
        required: true,
        type: "positional",
      },
      filter: { default: "", description: "Keep only the lines mentioning this", required: false, type: "positional" },
    },
    meta: {
      // The offline answer to whether a utility resolves, and to which property. A form that generates nothing prints
      // Nothing, which is the finding
      description: "The CSS UnoCSS generates for a markup fragment, the lines mentioning the filter",
      name: "ai:unocss:generate",
    },
    run: async ({ args }) => {
      const generator = await createGenerator(unoConfiguration);
      const { css } = await generator.generate(args.markup, { id: "fragment.vue", preflights: false });
      console.info(
        css
          .split("\n")
          .filter((line) => line.includes(args.filter))
          .join("\n"),
      );
    },
  }),
);
