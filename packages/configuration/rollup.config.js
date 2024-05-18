import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

export default defineConfig({
  input: "src/index.ts",
  output: { file: "dist/index.js", format: "esm" },
  plugins: [typescript()],
});
