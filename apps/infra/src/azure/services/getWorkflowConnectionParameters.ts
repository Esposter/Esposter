import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

// The `$connections` parameter every workflow passes to the managed API connection it calls through. The
// Connection name is an object key, so it has to be resolved with `pulumi.all` rather than interpolated.
export const getWorkflowConnectionParameters = (
  connection: azure_native.web.Connection,
  managedApiId: string,
): pulumi.Output<{ $connections: azure_native.types.input.logic.WorkflowParameterArgs }> =>
  pulumi.all([connection.name, connection.id]).apply(([connectionName, connectionId]) => ({
    $connections: {
      value: {
        [connectionName]: {
          connectionId,
          connectionName,
          connectionProperties: {
            authentication: {
              type: "ManagedServiceIdentity",
            },
          },
          id: managedApiId,
        },
      },
    },
  }));
