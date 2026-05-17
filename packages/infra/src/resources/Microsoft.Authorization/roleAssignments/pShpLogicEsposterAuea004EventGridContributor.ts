import AzureEventGridContributorRoleDefinitionId from "@/constants/AzureEventGridContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { pShpEvgtEsposterAuea001 } from "@/resources/Microsoft.EventGrid/topics/pShpEvgtEsposterAuea001";
import { pShpLogicEsposterAuea004 } from "@/resources/Microsoft.Logic/workflows/pShpLogicEsposterAuea004";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "1a67f981-2368-44f6-b3f6-0c10ba16c9c4";

export const pShpLogicEsposterAuea004EventGridContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "p-shp-logic-esposter-auea-004-event-grid-contributor",
    {
      principalId: pShpLogicEsposterAuea004.identity.apply((identity) => identity?.principalId ?? ""),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureEventGridContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.EventGrid/topics/${pShpEvgtEsposterAuea001.name}`,
    },
    {
      import:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001/providers/Microsoft.EventGrid/topics/p-shp-evgt-esposter-auea-001/providers/Microsoft.Authorization/roleAssignments/1a67f981-2368-44f6-b3f6-0c10ba16c9c4",
      protect: true,
    },
  );
