import * as azure_native from "@pulumi/azure-native";

export const pShpLogicEsposterAuea002Reader: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "p-shp-logic-esposter-auea-002-reader",
    {
      principalId: "f9d871df-7ea3-48fd-98f4-05504aaac686",
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "09a37d47-9e3f-45ea-9902-b99e486afdee",
      roleDefinitionId:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7",
      scope: "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001",
    },
    {
      import:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001/providers/Microsoft.Authorization/roleAssignments/09a37d47-9e3f-45ea-9902-b99e486afdee",
      protect: true,
    },
  );
