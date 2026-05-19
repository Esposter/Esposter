import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import AzureLogicAppsManagementSolutionProduct from "@/constants/AzureLogicAppsManagementSolutionProduct";
import AzureMicrosoftPublisherName from "@/constants/AzureMicrosoftPublisherName";
import { devLogEsposterAe001 } from "@/resources/Microsoft.OperationalInsights/workspaces/devLogEsposterAe001";
import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const solutionName = "LogicAppsManagement(dev-log-esposter-ae-001)";

export const logicAppsManagementDevLogEsposterAe001: azure_native.operationsmanagement.Solution =
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
        containedResources: [pulumi.interpolate`${devLogEsposterAe001.id}/views/${solutionName}`],
        workspaceResourceId: devLogEsposterAe001.id,
      },
      resourceGroupName: devRgEsposterAe001.name,
      solutionName,
      tags: {
        ...ApplicationTags,
      },
    },
    {
      parent: devRgEsposterAe001,
      protect: true,
    },
  );
