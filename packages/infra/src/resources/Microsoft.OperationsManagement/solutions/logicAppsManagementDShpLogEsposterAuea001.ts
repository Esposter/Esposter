import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import AzureLogicAppsManagementSolutionProduct from "@/constants/AzureLogicAppsManagementSolutionProduct";
import AzureMicrosoftPublisherName from "@/constants/AzureMicrosoftPublisherName";
import { dShpLogEsposterAuea001 } from "@/resources/Microsoft.OperationalInsights/workspaces/dShpLogEsposterAuea001";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const solutionName = "LogicAppsManagement(d-shp-log-esposter-auea-001)";

export const logicAppsManagementDShpLogEsposterAuea001: azure_native.operationsmanagement.Solution =
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
        containedResources: [pulumi.interpolate`${dShpLogEsposterAuea001.id}/views/${solutionName}`],
        workspaceResourceId: dShpLogEsposterAuea001.id,
      },
      resourceGroupName: dShpRgEsposterAuea001.name,
      solutionName,
      tags: {
        ...ApplicationTags,
      },
    },
    {
      protect: true,
    },
  );
