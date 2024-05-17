import typescript from "@rollup/plugin-typescript";
import type { RollupOptions } from "rollup";

export default {
  input: "src/index.ts",
  output: { file: "dist/index.js", format: "esm" },
  plugins: [typescript()],
} satisfies RollupOptions;
