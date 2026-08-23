import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";

const AzureResourceManagerManagedApiId: `/subscriptions/${string}/providers/Microsoft.Web/locations/${string}/managedApis/arm` = `/subscriptions/${AzureSubscriptionId}/providers/Microsoft.Web/locations/${AzureAustraliaEastLocation}/managedApis/arm`;

export default AzureResourceManagerManagedApiId;
