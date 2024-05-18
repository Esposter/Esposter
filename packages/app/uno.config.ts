import { defineConfig } from "unocss";

export default defineConfig({
  theme: {
    fontFamily: {
      inter: ["Inter"],
      montserrat: ["Montserrat"],
    },
  },
  rules: [["break-word", { "word-break": "break-word" }]],
});
