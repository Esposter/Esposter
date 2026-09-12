import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";

// A managed API is regional, so its id is the one template over the API's name in the stack's region
export const getManagedApiId = (managedApiName: string): string =>
  `/subscriptions/${AzureSubscriptionId}/providers/Microsoft.Web/locations/${AzureAustraliaEastLocation}/managedApis/${managedApiName}`;
