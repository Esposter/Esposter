import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";

export default defineConfig([
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.js", format: "esm" }],
    plugins: [typescript()],
  },
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts({ tsconfig: "tsconfig.build.json" })],
  },
]);
