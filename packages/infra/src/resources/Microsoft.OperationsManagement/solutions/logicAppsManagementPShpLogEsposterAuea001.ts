import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import AzureLogicAppsManagementSolutionProduct from "@/constants/AzureLogicAppsManagementSolutionProduct";
import AzureMicrosoftPublisherName from "@/constants/AzureMicrosoftPublisherName";
import { pShpLogEsposterAuea001 } from "@/resources/Microsoft.OperationalInsights/workspaces/pShpLogEsposterAuea001";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const solutionName = "LogicAppsManagement(p-shp-log-esposter-auea-001)";

export const logicAppsManagementPShpLogEsposterAuea001: azure_native.operationsmanagement.Solution =
  new azure_native.operationsmanagement.Solution(
    solutionName,
    {
      location: AzureAustraliaEastLocation,
      plan: {
        name: solutionName,
        product: AzureLogicAppsManagementSolutionProduct,
        promotionCode: "",
        publisher: AzureMicrosoftPublisherName,
      },
      properties: {
        containedResources: [pulumi.interpolate`${pShpLogEsposterAuea001.id}/views/${solutionName}`],
        workspaceResourceId: pShpLogEsposterAuea001.id,
      },
      resourceGroupName: pShpRgEsposterAuea001.name,
      solutionName,
      tags: {
        ...ApplicationTags,
      },
    },
    {
      protect: true,
    },
  );
