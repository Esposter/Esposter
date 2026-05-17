import AzureOwnerRoleDefinitionId from "@/constants/AzureOwnerRoleDefinitionId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import * as azure_native from "@pulumi/azure-native";

const roleAssignmentName = "e8e46111-7529-43b9-92af-5a8173601051";

export const jimmyChenOwner: azure_native.authorization.RoleAssignment = new azure_native.authorization.RoleAssignment(
  "jimmy-chen-owner",
  {
    principalId: "e87770fc-45f1-4ba0-ace2-54b0f804be86",
    principalType: azure_native.authorization.PrincipalType.User,
    roleAssignmentName,
    roleDefinitionId: AzureOwnerRoleDefinitionId,
    scope: `subscriptions/${AzureSubscriptionId}`,
  },
  {
    protect: true,
  },
);
