import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";

const AzureResourceManagerManagedApiId: `/subscriptions/${string}/providers/Microsoft.Web/locations/${string}/managedApis/arm` = `/subscriptions/${AzureSubscriptionId}/providers/Microsoft.Web/locations/${AzureAustraliaEastLocation}/managedApis/arm`;

export default AzureResourceManagerManagedApiId;
