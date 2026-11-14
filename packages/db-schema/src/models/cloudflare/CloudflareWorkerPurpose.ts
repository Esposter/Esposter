// The purpose token of a Worker's name: `web` serves the app and its routes, `functions` consumes the queues and runs
// the scheduled jobs. Each environment has one of each, named `<environment>-wkr-esposter-<purpose>`
export const CloudflareWorkerPurpose = { Functions: "functions", Web: "web" } as const;
export type CloudflareWorkerPurpose = (typeof CloudflareWorkerPurpose)[keyof typeof CloudflareWorkerPurpose];
