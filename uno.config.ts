import { defineConfig } from "unocss";

export default defineConfig({
  theme: {
    fontFamily: {
      Montserrat: ["Montserrat"],
    },
  },
  rules: [["break-word", { "word-break": "break-word" }]],
});
