import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";

const AzureResourceManagerManagedApiId: `/subscriptions/${string}/providers/Microsoft.Web/locations/${string}/managedApis/arm` = `/subscriptions/${AzureSubscriptionId}/providers/Microsoft.Web/locations/${AzureAustraliaEastLocation}/managedApis/arm`;

export default AzureResourceManagerManagedApiId;
