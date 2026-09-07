import * as azure_native from "@pulumi/azure-native";

// The Logic Apps service IP ranges for australiaeast. They belong to the region rather than to any one
// Workflow, so every workflow in both stacks declares the same block.
const AzureLogicAppEndpointsConfiguration: azure_native.types.input.logic.FlowEndpointsConfigurationArgs = {
  connector: {
    outgoingIpAddresses: [
      {
        address: "52.237.214.72",
      },
      {
        address: "13.72.243.10",
      },
      {
        address: "13.70.72.192/28",
      },
      {
        address: "13.70.78.224/27",
      },
      {
        address: "20.70.220.224/28",
      },
      {
        address: "20.70.220.192/27",
      },
      {
        address: "20.213.202.84",
      },
      {
        address: "20.213.202.51",
      },
    ],
  },
  workflow: {
    accessEndpointIpAddresses: [
      {
        address: "20.11.76.135",
      },
      {
        address: "20.11.77.54",
      },
      {
        address: "4.200.57.191",
      },
      {
        address: "20.11.77.111",
      },
      {
        address: "4.200.48.30",
      },
      {
        address: "4.198.185.192",
      },
      {
        address: "4.200.48.37",
      },
      {
        address: "4.200.57.70",
      },
    ],
    outgoingIpAddresses: [
      {
        address: "20.53.72.170",
      },
      {
        address: "20.53.106.182",
      },
      {
        address: "20.11.76.122",
      },
      {
        address: "20.11.77.49",
      },
      {
        address: "4.200.57.71",
      },
      {
        address: "20.11.77.107",
      },
      {
        address: "4.198.187.22",
      },
      {
        address: "4.198.185.90",
      },
      {
        address: "4.198.185.246",
      },
      {
        address: "4.200.58.227",
      },
    ],
  },
};

export default AzureLogicAppEndpointsConfiguration;
