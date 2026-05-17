import AzureReaderRoleDefinitionId from "@/constants/AzureReaderRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { dShpLogicEsposterAuea002 } from "@/resources/Microsoft.Logic/workflows/dShpLogicEsposterAuea002";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "9963c0ed-36bc-468f-8b87-952a4e89bdda";

export const dShpLogicEsposterAuea002Reader: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "d-shp-logic-esposter-auea-002-reader",
    {
      principalId: dShpLogicEsposterAuea002.identity.apply((identity) => identity?.principalId ?? ""),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureReaderRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}`,
    },
    {
      protect: true,
    },
  );
