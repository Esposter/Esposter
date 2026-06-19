import AzureEventGridEventSubscriptionContributorRoleDefinitionId from "@/azure/constants/AzureEventGridEventSubscriptionContributorRoleDefinitionId";
import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import DevLogicEsposterAe003PrincipalId from "@/azure/constants/DevLogicEsposterAe003PrincipalId";
import { devEvgtEsposterAe001 } from "@/azure/resources/Microsoft.EventGrid/topics/devEvgtEsposterAe001";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const devLogicEsposterAe003EventGridEventSubscriptionContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "dev-logic-esposter-ae-003-event-grid-event-subscription-contributor",
    {
      principalId: DevLogicEsposterAe003PrincipalId,
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureEventGridEventSubscriptionContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${devEvgtEsposterAe001.name}`,
    },
    {
      parent: devEvgtEsposterAe001,
      protect: true,
    },
  );
