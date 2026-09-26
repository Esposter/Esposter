import unoConfiguration from "@@/uno.config";
import { createGenerator } from "unocss";

// Prints the CSS UnoCSS generates for a markup fragment, keeping the lines that mention the filter — the offline answer
// To whether a utility resolves, and to which property. A form that generates nothing prints nothing, which is the finding
const [markup = "", filter = ""] = process.argv.slice(2);
const generator = await createGenerator(unoConfiguration);
const { css } = await generator.generate(markup, { id: "fragment.vue", preflights: false });
console.info(
  css
    .split("\n")
    .filter((line) => line.includes(filter))
    .join("\n"),
);
