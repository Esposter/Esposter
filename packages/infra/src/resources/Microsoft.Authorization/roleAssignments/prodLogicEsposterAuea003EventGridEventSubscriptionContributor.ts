import AzureEventGridEventSubscriptionContributorRoleDefinitionId from "@/constants/AzureEventGridEventSubscriptionContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { pShpEvgtEsposterAuea001 } from "@/resources/Microsoft.EventGrid/topics/pShpEvgtEsposterAuea001";
import { prodLogicEsposterAuea003 } from "@/resources/Microsoft.Logic/workflows/prodLogicEsposterAuea003";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { applyPrincipalId } from "@/services/applyPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const prodLogicEsposterAuea003EventGridEventSubscriptionContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-logic-esposter-auea-003-event-grid-event-subscription-contributor",
    {
      principalId: applyPrincipalId(prodLogicEsposterAuea003.identity, prodLogicEsposterAuea003.name),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: AzureEventGridEventSubscriptionContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.EventGrid/topics/${pShpEvgtEsposterAuea001.name}`,
    },
    {
      protect: true,
    },
  );
