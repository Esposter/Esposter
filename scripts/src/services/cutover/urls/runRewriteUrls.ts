import type { CutoverEnvironment } from "#src/models/cutover/CutoverEnvironment";

import { createCoreExecutor } from "#src/services/cutover/cloudflare/d1/createCoreExecutor";
import { getCloudflareEnvironment } from "#src/services/cutover/getCloudflareEnvironment";
import { readCutoverEnvironment } from "#src/services/cutover/readCutoverEnvironment";
import { requireEnvironmentVariable } from "#src/services/cutover/requireEnvironmentVariable";
import { rewriteBlobUrls } from "#src/services/cutover/urls/rewriteBlobUrls";

// Points every stored Azure blob URL at its bucket's public asset route. Re-running it changes nothing it already changed
export const runRewriteUrls = async (cutoverEnvironment: CutoverEnvironment): Promise<void> => {
  const variables = readCutoverEnvironment();
  const cloudflareEnvironment = getCloudflareEnvironment(cutoverEnvironment);
  const executor = createCoreExecutor(cloudflareEnvironment, variables);
  const rewritten = await rewriteBlobUrls(executor, requireEnvironmentVariable("PUBLIC_ASSETS_BASE_URL"));
  console.info(`${rewritten} stored blob URLs rewritten`);
};
