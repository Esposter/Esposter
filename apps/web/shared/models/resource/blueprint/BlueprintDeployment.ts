import type { Resource } from "@esposter/db-schema";

// One created resource paired with the manifest alias it was deployed from, so the client can show
// "this entry became this resource" links after a deploy
export interface BlueprintDeployment {
  key: string;
  resource: Resource;
}
