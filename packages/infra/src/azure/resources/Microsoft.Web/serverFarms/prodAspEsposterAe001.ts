import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastDisplayLocation from "@/azure/constants/AzureAustraliaEastDisplayLocation";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const appServicePlanName = "prod-asp-esposter-ae-001";

export const prodAspEsposterAe001: azure_native.web.AppServicePlan = new azure_native.web.AppServicePlan(
  appServicePlanName,
  {
    asyncScalingEnabled: false,
    elasticScaleEnabled: false,
    hyperV: false,
    isSpot: false,
    isXenon: false,
    kind: "functionapp",
    location: AzureAustraliaEastDisplayLocation,
    maximumElasticWorkerCount: 1,
    name: appServicePlanName,
    perSiteScaling: false,
    reserved: false,
    resourceGroupName: prodRgEsposterAe001.name,
    sku: {
      capacity: 0,
      family: "Y",
      name: "Y1",
      size: "Y1",
      tier: "Dynamic",
    },
    tags: {
      ...ApplicationTags,
    },
    targetWorkerCount: 0,
    targetWorkerSizeId: 0,
    zoneRedundant: false,
  },
  {
    parent: prodRgEsposterAe001,
    protect: true,
  },
);
