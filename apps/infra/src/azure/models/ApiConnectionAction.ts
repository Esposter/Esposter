import type { HttpMethod } from "#src/azure/models/HttpMethod";
import type * as pulumi from "@pulumi/pulumi";

export interface ApiConnectionAction {
  inputs: {
    body?: object;
    host: { connection: { name: pulumi.Output<string> } };
    method: HttpMethod;
    path: pulumi.Output<string>;
    queries: Record<string, string>;
  };
  runAfter?: Record<string, string[]>;
  type: "ApiConnection";
}
