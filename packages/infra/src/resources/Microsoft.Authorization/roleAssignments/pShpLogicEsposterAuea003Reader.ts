import * as azure_native from "@pulumi/azure-native";

export const pShpLogicEsposterAuea003Reader: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "p-shp-logic-esposter-auea-003-reader",
    {
      principalId: "1dc56357-dd42-4c0c-8de3-333a5c531267",
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "73352b32-3b1b-43a8-992b-1a336042993a",
      roleDefinitionId:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7",
      scope: "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001",
    },
    {
      import:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001/providers/Microsoft.Authorization/roleAssignments/73352b32-3b1b-43a8-992b-1a336042993a",
      protect: true,
    },
  );
