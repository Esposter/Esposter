import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";

export default defineConfig([
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.js", format: "es" }],
    // Don't use builtin node modules as that would assume a server environment rather than a browser environment
    plugins: [commonjs(), json(), nodeResolve({ preferBuiltins: false }), typescript()],
  },
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts({ tsconfig: "tsconfig.build.json" })],
  },
]);
