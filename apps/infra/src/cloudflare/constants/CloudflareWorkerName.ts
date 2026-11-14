// Each Worker's script name. A wrangler config names the same string (`name`, or the `dev` environment's `name`), and
// Pulumi routes a hostname to one or consumes a queue for one by it. The web Worker is `esposter` in prod and
// `esposter-dev` in dev; the functions Worker is `esposter-functions` and `esposter-functions-dev`.
const CloudflareWorkerName: {
  esposter: string;
  esposterDev: string;
  esposterFunctions: string;
  esposterFunctionsDev: string;
} = {
  esposter: "esposter",
  esposterDev: "esposter-dev",
  esposterFunctions: "esposter-functions",
  esposterFunctionsDev: "esposter-functions-dev",
};

export default CloudflareWorkerName;
