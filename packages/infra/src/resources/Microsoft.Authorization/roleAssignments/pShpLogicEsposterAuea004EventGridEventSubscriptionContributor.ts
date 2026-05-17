import AzureEventGridEventSubscriptionContributorRoleDefinitionId from "@/constants/AzureEventGridEventSubscriptionContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { pShpEvgtEsposterAuea001 } from "@/resources/Microsoft.EventGrid/topics/pShpEvgtEsposterAuea001";
import { pShpLogicEsposterAuea004 } from "@/resources/Microsoft.Logic/workflows/pShpLogicEsposterAuea004";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { applyPrincipalId } from "@/services/applyPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "ebf7aab7-2ace-46af-9d95-f4b7ed2ab4ca";

export const pShpLogicEsposterAuea004EventGridEventSubscriptionContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "p-shp-logic-esposter-auea-004-event-grid-event-subscription-contributor",
    {
      principalId: applyPrincipalId(pShpLogicEsposterAuea004.identity, pShpLogicEsposterAuea004.name),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureEventGridEventSubscriptionContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.EventGrid/topics/${pShpEvgtEsposterAuea001.name}`,
    },
    {
      protect: true,
    },
  );
