import AzureEventGridEventSubscriptionContributorRoleDefinitionId from "@/constants/AzureEventGridEventSubscriptionContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { dShpEvgtEsposterAuea001 } from "@/resources/Microsoft.EventGrid/topics/dShpEvgtEsposterAuea001";
import { dShpLogicEsposterAuea003 } from "@/resources/Microsoft.Logic/workflows/dShpLogicEsposterAuea003";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { applyPrincipalId } from "@/services/applyPrincipalId";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "8288f309-e02f-429d-b3fb-b200e634d73e";

export const dShpLogicEsposterAuea003EventGridEventSubscriptionContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "d-shp-logic-esposter-auea-003-event-grid-event-subscription-contributor",
    {
      principalId: applyPrincipalId(dShpLogicEsposterAuea003.identity, dShpLogicEsposterAuea003.name),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureEventGridEventSubscriptionContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}/providers/Microsoft.EventGrid/topics/${dShpEvgtEsposterAuea001.name}`,
    },
    {
      protect: true,
    },
  );
