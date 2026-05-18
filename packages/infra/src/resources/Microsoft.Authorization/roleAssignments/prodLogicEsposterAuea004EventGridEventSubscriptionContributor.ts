import AzureEventGridEventSubscriptionContributorRoleDefinitionId from "@/constants/AzureEventGridEventSubscriptionContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { pShpEvgtEsposterAuea001 } from "@/resources/Microsoft.EventGrid/topics/pShpEvgtEsposterAuea001";
import { prodLogicEsposterAuea004 } from "@/resources/Microsoft.Logic/workflows/prodLogicEsposterAuea004";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { applyPrincipalId } from "@/services/applyPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "def0cdb6-9ad1-50ad-434f-82190d817f65";

export const prodLogicEsposterAuea004EventGridEventSubscriptionContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "prod-logic-esposter-auea-004-event-grid-event-subscription-contributor",
    {
      principalId: applyPrincipalId(prodLogicEsposterAuea004.identity, prodLogicEsposterAuea004.name),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureEventGridEventSubscriptionContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.EventGrid/topics/${pShpEvgtEsposterAuea001.name}`,
    },
    {
      protect: true,
    },
  );
