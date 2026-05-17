import * as azure_native from "@pulumi/azure-native";

export const pShpLogicEsposterAuea004Reader: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "p-shp-logic-esposter-auea-004-reader",
    {
      principalId: "a8d105b9-2ce4-4871-896e-54a48e11d226",
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "5b46b2c3-2645-4cdf-9ca6-3476bd7745c8",
      roleDefinitionId:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7",
      scope: "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001",
    },
    {
      import:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001/providers/Microsoft.Authorization/roleAssignments/5b46b2c3-2645-4cdf-9ca6-3476bd7745c8",
      protect: true,
    },
  );
