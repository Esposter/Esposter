import AzureEventGridContributorRoleDefinitionId from "@/constants/AzureEventGridContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { dShpEvgtEsposterAuea001 } from "@/resources/Microsoft.EventGrid/topics/dShpEvgtEsposterAuea001";
import { dShpLogicEsposterAuea004 } from "@/resources/Microsoft.Logic/workflows/dShpLogicEsposterAuea004";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "05e07a08-21ed-4a41-b1c9-5becf0830825";

export const dShpLogicEsposterAuea004EventGridContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "d-shp-logic-esposter-auea-004-event-grid-contributor",
    {
      principalId: dShpLogicEsposterAuea004.identity.apply((identity) => identity?.principalId ?? ""),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureEventGridContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}/providers/Microsoft.EventGrid/topics/${dShpEvgtEsposterAuea001.name}`,
    },
    {
      protect: true,
    },
  );
