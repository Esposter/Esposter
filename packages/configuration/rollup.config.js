import { defineConfig } from "rollup";

export default defineConfig({
  input: "src/index.ts",
  output: { file: "dist/index.js", format: "esm" },
});
