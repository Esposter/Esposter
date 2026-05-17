import * as azure_native from "@pulumi/azure-native";

export const dShpLogicEsposterAuea004Reader: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "d-shp-logic-esposter-auea-004-reader",
    {
      principalId: "bd859fb2-d704-41de-9beb-6cc3f693a238",
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "ed4c17de-a050-402b-99b3-1e4f2fd48643",
      roleDefinitionId:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7",
      scope: "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001",
    },
    {
      import:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.Authorization/roleAssignments/ed4c17de-a050-402b-99b3-1e4f2fd48643",
      protect: true,
    },
  );
