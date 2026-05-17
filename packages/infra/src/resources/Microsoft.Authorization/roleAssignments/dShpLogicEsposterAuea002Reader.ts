import * as azure_native from "@pulumi/azure-native";

export const dShpLogicEsposterAuea002Reader: azure_native.authorization.RoleAssignment =
  new azure_native.authorization.RoleAssignment(
    "d-shp-logic-esposter-auea-002-reader",
    {
      principalId: "c22c79d5-66df-4ae9-9395-5657876464dc",
      principalType: azure_native.authorization.PrincipalType.ServicePrincipal,
      roleAssignmentName: "9963c0ed-36bc-468f-8b87-952a4e89bdda",
      roleDefinitionId:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7",
      scope: "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001",
    },
    {
      import:
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.Authorization/roleAssignments/9963c0ed-36bc-468f-8b87-952a4e89bdda",
      protect: true,
    },
  );
