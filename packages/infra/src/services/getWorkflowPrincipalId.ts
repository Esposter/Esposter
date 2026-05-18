import type * as pulumi from "@pulumi/pulumi";

import { InvalidOperationError, Operation } from "@esposter/shared";
import * as azure_native from "@pulumi/azure-native";

export const getWorkflowPrincipalId = (
  resourceGroupName: pulumi.Input<string>,
  workflowName: pulumi.Input<string>,
): pulumi.Output<string> =>
  azure_native.logic.getWorkflowOutput({ resourceGroupName, workflowName }).apply((workflow) => {
    if (!workflow.identity?.principalId)
      throw new InvalidOperationError(
        Operation.Read,
        workflow.name,
        "principalId is missing — ensure the workflow has a system-assigned identity enabled",
      );
    return workflow.identity.principalId;
  });
