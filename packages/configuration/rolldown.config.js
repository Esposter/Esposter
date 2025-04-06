import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

export default defineConfig([
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.js", format: "esm" }],
  },
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts({ tsconfig: "tsconfig.build.json" })],
  },
]);
