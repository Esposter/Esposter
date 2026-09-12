import * as pulumi from "@pulumi/pulumi";

const azureNativeConfiguration = new pulumi.Config("azure-native");
const AzureSubscriptionId: string = azureNativeConfiguration.require("subscriptionId");

export default AzureSubscriptionId;
