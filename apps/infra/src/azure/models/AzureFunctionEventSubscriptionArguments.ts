import * as azure_native from "@pulumi/azure-native";

export interface AzureFunctionEventSubscriptionArguments {
  deadLetterDestination: azure_native.types.input.eventgrid.StorageBlobDeadLetterDestinationArgs;
  destination: azure_native.types.input.eventgrid.AzureFunctionEventSubscriptionDestinationArgs;
  eventDeliverySchema: azure_native.eventgrid.EventDeliverySchema;
  filter: azure_native.types.input.eventgrid.EventSubscriptionFilterArgs;
  retryPolicy: azure_native.types.input.eventgrid.RetryPolicyArgs;
}
