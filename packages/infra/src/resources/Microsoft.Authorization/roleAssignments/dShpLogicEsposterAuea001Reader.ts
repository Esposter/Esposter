import * as azure_native from "@pulumi/azure-native";

export const dShpLogicEsposterAuea001Reader: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "d-shp-logic-esposter-auea-001-reader",
    {
      principalId: "6719a20b-86e0-4065-858c-039b059a4e98",
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "49b8ae0f-621c-4b8e-8169-e7ea3809891b",
      roleDefinitionId:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7",
      scope: "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001",
    },
    {
      import:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.Authorization/roleAssignments/49b8ae0f-621c-4b8e-8169-e7ea3809891b",
      protect: true,
    },
  );
