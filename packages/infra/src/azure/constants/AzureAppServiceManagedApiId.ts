import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";

const AzureAppServiceManagedApiId: `/subscriptions/${string}/providers/Microsoft.Web/locations/${string}/managedApis/azureappservice` = `/subscriptions/${AzureSubscriptionId}/providers/Microsoft.Web/locations/${AzureAustraliaEastLocation}/managedApis/azureappservice`;

export default AzureAppServiceManagedApiId;
