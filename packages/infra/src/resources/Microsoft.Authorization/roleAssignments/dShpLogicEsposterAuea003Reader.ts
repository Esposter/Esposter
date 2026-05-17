import AzureReaderRoleDefinitionId from "@/constants/AzureReaderRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { dShpLogicEsposterAuea003 } from "@/resources/Microsoft.Logic/workflows/dShpLogicEsposterAuea003";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const roleAssignmentName = "43be0627-72d6-459e-8ffe-3c57c6551782";

export const dShpLogicEsposterAuea003Reader: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "d-shp-logic-esposter-auea-003-reader",
    {
      principalId: dShpLogicEsposterAuea003.identity.apply((identity) => identity?.principalId ?? ""),
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName,
      roleDefinitionId: AzureReaderRoleDefinitionId,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}`,
    },
    {
      protect: true,
    },
  );
