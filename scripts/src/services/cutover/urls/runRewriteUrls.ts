import { createCoreExecutor } from "#src/services/cutover/cloudflare/d1/createCoreExecutor";
import { readCutoverEnvironment } from "#src/services/cutover/readCutoverEnvironment";
import { requireEnvironmentVariable } from "#src/services/cutover/requireEnvironmentVariable";
import { rewriteBlobUrls } from "#src/services/cutover/urls/rewriteBlobUrls";

// Points every stored Azure blob URL at its bucket's public asset route. Re-running it changes nothing it already changed
export const runRewriteUrls = async (): Promise<void> => {
  const executor = createCoreExecutor(readCutoverEnvironment());
  const rewritten = await rewriteBlobUrls(executor, requireEnvironmentVariable("PUBLIC_ASSETS_BASE_URL"));
  console.info(`${rewritten} stored blob URLs rewritten`);
};
