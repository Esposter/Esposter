import AzureEventGridEventSubscriptionContributorRoleDefinitionId from "@/constants/AzureEventGridEventSubscriptionContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { pShpEvgtEsposterAuea001 } from "@/resources/Microsoft.EventGrid/topics/pShpEvgtEsposterAuea001";
import { prodLogicEsposterAe003 } from "@/resources/Microsoft.Logic/workflows/prodLogicEsposterAe003";
import { prodRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { getWorkflowPrincipalId } from "@/services/getWorkflowPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const prodLogicEsposterAe003EventGridEventSubscriptionContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-logic-esposter-ae-003-event-grid-event-subscription-contributor",
    {
      principalId: getWorkflowPrincipalId(prodRgEsposterAe001.name, prodLogicEsposterAe003.name),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureEventGridEventSubscriptionContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.EventGrid/topics/${pShpEvgtEsposterAuea001.name}`,
    },
    {
      parent: prodLogicEsposterAe003,
      protect: true,
    },
  );
