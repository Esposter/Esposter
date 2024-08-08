import { defineConfig } from "unocss";

export default defineConfig({
  rules: [["break-word", { "word-break": "break-word" }]],
  theme: {
    fontFamily: {
      inter: ["Inter"],
      montserrat: ["Montserrat"],
    },
  },
});
