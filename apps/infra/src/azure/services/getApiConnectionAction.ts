import type { ApiConnectionAction } from "#src/azure/models/ApiConnectionAction";
import type { ApiConnectionActionOptions } from "#src/azure/models/ApiConnectionActionOptions";

import * as pulumi from "@pulumi/pulumi";

export const getApiConnectionAction = ({
  body,
  connection,
  method,
  path,
  queries,
  runAfter,
}: ApiConnectionActionOptions): ApiConnectionAction => ({
  inputs: {
    body,
    host: {
      connection: {
        name: pulumi.interpolate`@parameters('$connections')['${connection.name}']['connectionId']`,
      },
    },
    method,
    path,
    queries,
  },
  runAfter,
  type: "ApiConnection",
});
