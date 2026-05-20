import AzureEventGridDataSenderRoleDefinitionId from "@/constants/AzureEventGridDataSenderRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import DevFuncEsposter001PrincipalId from "@/constants/DevFuncEsposter001PrincipalId";
import { devEvgtEsposterAe001 } from "@/resources/Microsoft.EventGrid/topics/devEvgtEsposterAe001";
import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const devFuncEsposter001EventGridDataSender: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-func-esposter-001-event-grid-data-sender",
    {
      principalId: DevFuncEsposter001PrincipalId,
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
