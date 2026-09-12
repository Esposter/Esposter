import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";

// A built-in role is addressed through the subscription it is assigned in, so every role definition id is the
// One template over a role's fixed GUID
export const getRoleDefinitionId = (roleDefinitionGuid: string): string =>
  `/subscriptions/${AzureSubscriptionId}/providers/Microsoft.Authorization/roleDefinitions/${roleDefinitionGuid}`;
