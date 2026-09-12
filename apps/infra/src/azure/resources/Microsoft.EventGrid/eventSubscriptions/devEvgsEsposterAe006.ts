import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import { devEvgtEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/topics/devEvgtEsposterAe001";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001Deadletter } from "#src/azure/resources/Microsoft.Storage/storageAccounts/blobContainers/devstesposter001Deadletter";
import { devstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import { devFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import { getAzureFunctionEventSubscriptionArguments } from "#src/azure/services/getAzureFunctionEventSubscriptionArguments";
import { AzureFunction } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const eventSubscriptionName = "dev-evgs-esposter-ae-006";

export const devEvgsEsposterAe006: azure_native.eventgrid.EventSubscription =
  new azure_native.eventgrid.EventSubscription(
    eventSubscriptionName,
    {
      ...getAzureFunctionEventSubscriptionArguments(
        AzureFunction.ProcessBlobDeletion,
        devFuncEsposter001,
        devstesposter001,
        devstesposter001Deadletter,
      ),
      eventSubscriptionName,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${devEvgtEsposterAe001.name}`,
    },
    {
      parent: devEvgtEsposterAe001,
      protect: true,
    },
  );
