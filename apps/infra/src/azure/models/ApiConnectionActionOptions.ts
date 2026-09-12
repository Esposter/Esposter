import type { ApiConnectionAction } from "#src/azure/models/ApiConnectionAction";
import type * as azure_native from "@pulumi/azure-native";

export interface ApiConnectionActionOptions extends Pick<ApiConnectionAction, "runAfter"> {
  body?: object;
  connection: azure_native.web.Connection;
  method: ApiConnectionAction["inputs"]["method"];
  path: ApiConnectionAction["inputs"]["path"];
  queries: ApiConnectionAction["inputs"]["queries"];
}
