import * as azure_native from "@pulumi/azure-native";

export const pShpLogicEsposterAuea001Reader: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "p-shp-logic-esposter-auea-001-reader",
    {
      principalId: "c47e1d9f-27fe-4372-a72a-a145cafe88f2",
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "6390e1c9-6574-4ba5-9332-26a8ef84bbbb",
      roleDefinitionId:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7",
      scope: "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001",
    },
    {
      import:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001/providers/Microsoft.Authorization/roleAssignments/6390e1c9-6574-4ba5-9332-26a8ef84bbbb",
      protect: true,
    },
  );
