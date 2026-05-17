import AzureEventGridContributorRoleDefinitionId from "@/constants/AzureEventGridContributorRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { pShpEvgtEsposterAuea001 } from "@/resources/Microsoft.EventGrid/topics/pShpEvgtEsposterAuea001";
import { pShpLogicEsposterAuea003 } from "@/resources/Microsoft.Logic/workflows/pShpLogicEsposterAuea003";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "045f6e77-e425-4349-b563-3cb98a1aea38";

export const pShpLogicEsposterAuea003EventGridContributor: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "p-shp-logic-esposter-auea-003-event-grid-contributor",
    {
      principalId: pShpLogicEsposterAuea003.identity.apply((identity) => identity?.principalId ?? ""),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureEventGridContributorRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${pShpRgEsposterAuea001.name}/providers/Microsoft.EventGrid/topics/${pShpEvgtEsposterAuea001.name}`,
    },
    {
      import:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001/providers/Microsoft.EventGrid/topics/p-shp-evgt-esposter-auea-001/providers/Microsoft.Authorization/roleAssignments/045f6e77-e425-4349-b563-3cb98a1aea38",
      protect: true,
    },
  );
