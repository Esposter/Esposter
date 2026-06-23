import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import AzureLogicAppsManagementSolutionProduct from "@/azure/constants/AzureLogicAppsManagementSolutionProduct";
import AzureMicrosoftPublisherName from "@/azure/constants/AzureMicrosoftPublisherName";
import { prodLogEsposterAe001 } from "@/azure/resources/Microsoft.OperationalInsights/workspaces/prodLogEsposterAe001";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const solutionName = "LogicAppsManagement(prod-log-esposter-ae-001)";

export const logicAppsManagementProdLogEsposterAe001: azure_native.operationsmanagement.Solution =
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
        containedResources: [pulumi.interpolate`${prodLogEsposterAe001.id}/views/${solutionName}`],
        workspaceResourceId: prodLogEsposterAe001.id,
      },
      resourceGroupName: prodRgEsposterAe001.name,
      solutionName,
      tags: {
        ...ApplicationTags,
      },
    },
    {
      parent: prodLogEsposterAe001,
      protect: true,
    },
  );
