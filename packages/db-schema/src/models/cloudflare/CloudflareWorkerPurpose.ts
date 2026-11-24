// The purpose token of a Worker's name: `web` serves the app and its routes, and `realtime` holds the objects that
// Carry live state. the sockets that carry that state are the realtime Worker's too. `jobs` consumes the queues and
// Runs the scheduled jobs. each environment has one Worker of each purpose, named
// `<environment>-wkr-esposter-<purpose>`.
export const CloudflareWorkerPurpose = { Jobs: "jobs", Realtime: "realtime", Web: "web" } as const;
export type CloudflareWorkerPurpose = (typeof CloudflareWorkerPurpose)[keyof typeof CloudflareWorkerPurpose];
