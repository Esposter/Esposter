import * as azure_native from "@pulumi/azure-native";

export const dShpLogicEsposterAuea003Reader: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "d-shp-logic-esposter-auea-003-reader",
    {
      principalId: "93544b2d-50d4-42ec-b3ad-ece607e0aeb2",
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "43be0627-72d6-459e-8ffe-3c57c6551782",
      roleDefinitionId:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7",
      scope: "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001",
    },
    {
      import:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.Authorization/roleAssignments/43be0627-72d6-459e-8ffe-3c57c6551782",
      protect: true,
    },
  );
