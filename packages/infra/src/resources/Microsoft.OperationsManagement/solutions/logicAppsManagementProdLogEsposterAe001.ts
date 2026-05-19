import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import AzureLogicAppsManagementSolutionProduct from "@/constants/AzureLogicAppsManagementSolutionProduct";
import AzureMicrosoftPublisherName from "@/constants/AzureMicrosoftPublisherName";
import { prodLogEsposterAe001 } from "@/resources/Microsoft.OperationalInsights/workspaces/prodLogEsposterAe001";
import { prodRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
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
      parent: prodRgEsposterAe001,
      protect: true,
    },
  );
