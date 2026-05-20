import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastDisplayLocation from "@/constants/AzureAustraliaEastDisplayLocation";
import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const appServicePlanName = "dev-asp-esposter-ae-001";

export const devAspEsposterAe001: azure_native.web.AppServicePlan = new azure_native.web.AppServicePlan(
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
    resourceGroupName: devRgEsposterAe001.name,
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
    parent: devRgEsposterAe001,
    protect: true,
  },
);
