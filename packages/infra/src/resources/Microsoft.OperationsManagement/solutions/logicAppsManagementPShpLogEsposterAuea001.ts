import { pShpLogEsposterAuea001 } from "@/resources/Microsoft.OperationalInsights/workspaces/pShpLogEsposterAuea001";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const logicAppsManagementPShpLogEsposterAuea001: azure_native.operationsmanagement.Solution =
  new azure_native.operationsmanagement.Solution(
    "LogicAppsManagement(p-shp-log-esposter-auea-001)",
    {
      location: "australiaeast",
      plan: {
        name: "LogicAppsManagement(p-shp-log-esposter-auea-001)",
        product: "OMSGallery/LogicAppsManagement",
        promotionCode: "",
        publisher: "Microsoft",
      },
      properties: {
        containedResources: [
          "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001/providers/Microsoft.OperationalInsights/workspaces/p-shp-log-esposter-auea-001/views/LogicAppsManagement(p-shp-log-esposter-auea-001)",
        ],
        workspaceResourceId: pShpLogEsposterAuea001.id,
      },
      resourceGroupName: pShpRgEsposterAuea001.name,
      solutionName: "LogicAppsManagement(p-shp-log-esposter-auea-001)",
      tags: {
        Application: "Esposter",
      },
    },
    {
      protect: true,
    },
  );
