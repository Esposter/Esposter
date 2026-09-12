import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import { prodEvgtEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/topics/prodEvgtEsposterAe001";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001Deadletter } from "#src/azure/resources/Microsoft.Storage/storageAccounts/blobContainers/prodstesposter001Deadletter";
import { prodstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import { prodFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/prodFuncEsposter001";
import { getAzureFunctionEventSubscriptionArguments } from "#src/azure/services/getAzureFunctionEventSubscriptionArguments";
import { AzureFunction } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const eventSubscriptionName = "prod-evgs-esposter-ae-006";

export const prodEvgsEsposterAe006: azure_native.eventgrid.EventSubscription =
  new azure_native.eventgrid.EventSubscription(
    eventSubscriptionName,
    {
      ...getAzureFunctionEventSubscriptionArguments(
        AzureFunction.ProcessBlobDeletion,
        prodFuncEsposter001,
        prodstesposter001,
        prodstesposter001Deadletter,
      ),
      eventSubscriptionName,
      scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${prodEvgtEsposterAe001.name}`,
    },
    {
      parent: prodEvgtEsposterAe001,
      protect: true,
    },
  );
