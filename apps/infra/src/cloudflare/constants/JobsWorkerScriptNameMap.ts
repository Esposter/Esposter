import DevJobsWorkerScriptName from "#src/cloudflare/constants/DevJobsWorkerScriptName";
import ProdJobsWorkerScriptName from "#src/cloudflare/constants/ProdJobsWorkerScriptName";
import { CloudflareEnvironment } from "@esposter/db-schema";

// The jobs Worker each environment's queue consumers deliver to
const JobsWorkerScriptNameMap: Record<CloudflareEnvironment, string> = {
  [CloudflareEnvironment.Development]: DevJobsWorkerScriptName,
  [CloudflareEnvironment.Production]: ProdJobsWorkerScriptName,
};

export default JobsWorkerScriptNameMap;
