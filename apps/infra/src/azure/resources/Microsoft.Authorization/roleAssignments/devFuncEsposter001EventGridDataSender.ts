import AzureEventGridDataSenderRoleDefinitionId from "#src/azure/constants/AzureEventGridDataSenderRoleDefinitionId";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import { devEvgtEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/topics/devEvgtEsposterAe001";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import { getPrincipalId } from "#src/azure/services/getPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const devFuncEsposter001EventGridDataSender: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-func-esposter-001-event-grid-data-sender",
    {
      principalId: getPrincipalId(devFuncEsposter001),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "32f47bc4-3d61-497f-875b-f0eaea1e6f9c",
      roleDefinitionId: AzureEventGridDataSenderRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${devEvgtEsposterAe001.name}`,
    },
    {
      parent: devEvgtEsposterAe001,
      protect: true,
    },
  );
