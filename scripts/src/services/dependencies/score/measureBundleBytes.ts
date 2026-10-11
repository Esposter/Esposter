import { rolldown } from "rolldown";
import { gzipSync } from "node:zlib";

// The gzipped bytes of one browser bundle of the entry. Its exports are its roots, so the bundle keeps what it
// Re-exports and nothing else; an external is left to the app, which ships it already.
export const measureBundleBytes = async (entryPath: string, externals: string[]): Promise<number> => {
  const build = await rolldown({
    external: (id: string) => externals.some((external) => id === external || id.startsWith(`${external}/`)),
    input: entryPath,
    logLevel: "silent",
    platform: "browser",
  });
  const { output } = await build.generate({ format: "esm", minify: true });
  await build.close();

  const code = output.flatMap((chunk) => (chunk.type === "chunk" ? [chunk.code] : [])).join("\n");
  return gzipSync(code, { level: 9 }).byteLength;
};
