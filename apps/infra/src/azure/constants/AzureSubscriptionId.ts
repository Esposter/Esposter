import { Config } from "@pulumi/pulumi";

const azureNativeConfiguration = new Config("azure-native");
const AzureSubscriptionId: string = azureNativeConfiguration.require("subscriptionId");

export default AzureSubscriptionId;
