import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const aspDshprgesposterauea00194fb: azure_native.web.AppServicePlan = new azure_native.web.AppServicePlan(
  "ASP-dshprgesposterauea001-94fb",
  {
    asyncScalingEnabled: false,
    elasticScaleEnabled: false,
    hyperV: false,
    isSpot: false,
    isXenon: false,
    kind: "functionapp",
    location: "Australia East",
    maximumElasticWorkerCount: 1,
    name: "ASP-dshprgesposterauea001-94fb",
    perSiteScaling: false,
    reserved: false,
    resourceGroupName: dShpRgEsposterAuea001.name,
    sku: {
      capacity: 0,
      family: "Y",
      name: "Y1",
      size: "Y1",
      tier: "Dynamic",
    },
    tags: {
      Application: "Esposter",
    },
    targetWorkerCount: 0,
    targetWorkerSizeId: 0,
    zoneRedundant: false,
  },
  {
    protect: true,
  },
);
