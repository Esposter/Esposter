import AzureOwnerRoleDefinitionId from "#src/azure/constants/AzureOwnerRoleDefinitionId";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import JimmyChenPrincipalId from "#src/azure/constants/JimmyChenPrincipalId";
import * as azure_native from "@pulumi/azure-native";

export const jimmyChenOwner: azure_native.authorization.RoleAssignment = new azure_native.authorization.RoleAssignment(
  "jimmy-chen-owner",
  {
    principalId: JimmyChenPrincipalId,
    principalType: azure_native.authorization.PrincipalType.User,
    roleAssignmentName: "e8e46111-7529-43b9-92af-5a8173601051",
    roleDefinitionId: AzureOwnerRoleDefinitionId,
    scope: `subscriptions/${AzureSubscriptionId}`,
  },
  { protect: true },
);
