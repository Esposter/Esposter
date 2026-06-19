import AzureEventGridDataSenderRoleDefinitionId from "@/azure/constants/AzureEventGridDataSenderRoleDefinitionId";
import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import ProdFuncEsposter001PrincipalId from "@/azure/constants/ProdFuncEsposter001PrincipalId";
import { prodEvgtEsposterAe001 } from "@/azure/resources/Microsoft.EventGrid/topics/prodEvgtEsposterAe001";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const prodFuncEsposter001EventGridDataSender: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-func-esposter-001-event-grid-data-sender",
    {
      principalId: ProdFuncEsposter001PrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "e96b906c-f0cf-42b4-bd65-ad4b5fd65ef9",
      roleDefinitionId: AzureEventGridDataSenderRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${prodEvgtEsposterAe001.name}`,
    },
    {
      parent: prodEvgtEsposterAe001,
      protect: true,
    },
  );
