import AzureEventGridContributorRoleDefinitionId from "@/constants/AzureEventGridContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { dShpEvgtEsposterAuea001 } from "@/resources/Microsoft.EventGrid/topics/dShpEvgtEsposterAuea001";
import { dShpLogicEsposterAuea003 } from "@/resources/Microsoft.Logic/workflows/dShpLogicEsposterAuea003";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "2f9a9d3b-ec72-4101-899c-cbe91cae494f";

export const dShpLogicEsposterAuea003EventGridContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "d-shp-logic-esposter-auea-003-event-grid-contributor",
    {
      principalId: dShpLogicEsposterAuea003.identity.apply((identity) => identity?.principalId ?? ""),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureEventGridContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}/providers/Microsoft.EventGrid/topics/${dShpEvgtEsposterAuea001.name}`,
    },
    {
      protect: true,
    },
  );
