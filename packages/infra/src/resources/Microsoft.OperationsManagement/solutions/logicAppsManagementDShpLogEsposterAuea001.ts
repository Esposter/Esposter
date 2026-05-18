import { dShpLogEsposterAuea001 } from "@/resources/Microsoft.OperationalInsights/workspaces/dShpLogEsposterAuea001";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const logicAppsManagementDShpLogEsposterAuea001: azure_native.operationsmanagement.Solution =
  new azure_native.operationsmanagement.Solution(
    "LogicAppsManagement(d-shp-log-esposter-auea-001)",
    {
      location: "australiaeast",
      plan: {
        name: "LogicAppsManagement(d-shp-log-esposter-auea-001)",
        product: "OMSGallery/LogicAppsManagement",
        promotionCode: "",
        publisher: "Microsoft",
      },
      properties: {
        containedResources: [
          "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.OperationalInsights/workspaces/d-shp-log-esposter-auea-001/views/LogicAppsManagement(d-shp-log-esposter-auea-001)",
        ],
        workspaceResourceId: dShpLogEsposterAuea001.id,
      },
      resourceGroupName: dShpRgEsposterAuea001.name,
      solutionName: "LogicAppsManagement(d-shp-log-esposter-auea-001)",
      tags: {
        Application: "Esposter",
      },
    },
    {
      protect: true,
    },
  );
