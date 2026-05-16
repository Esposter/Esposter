import * as azure_native from "@pulumi/azure-native";

export const dShpFuncEsposterAuea001: azure_native.web.WebApp = new azure_native.web.WebApp(
  "d-shp-func-esposter-auea-001",
  {
    clientAffinityEnabled: false,
    clientAffinityProxyEnabled: false,
    clientCertEnabled: false,
    clientCertMode: azure_native.web.ClientCertMode.Required,
    containerSize: 1536,
    customDomainVerificationId: "2056A3EEB73FBB528BC43CDFDCC87B0ED9A0C4C7C520BE7663108B19B35289C8",
    dailyMemoryTimeQuota: 0,
    enabled: true,
    endToEndEncryptionEnabled: false,
    hostNamesDisabled: false,
    hostNameSslStates: [
      {
        hostType: azure_native.web.HostType.Standard,
        name: "d-shp-func-esposter-auea-001.azurewebsites.net",
        sslState: azure_native.web.SslState.Disabled,
      },
      {
        hostType: azure_native.web.HostType.Repository,
        name: "d-shp-func-esposter-auea-001.scm.azurewebsites.net",
        sslState: azure_native.web.SslState.Disabled,
      },
    ],
    httpsOnly: true,
    hyperV: false,
    identity: {
      type: azure_native.web.ManagedServiceIdentityType.SystemAssigned,
    },
    ipMode: azure_native.web.IPMode.IPv4,
    isXenon: false,
    keyVaultReferenceIdentity: "SystemAssigned",
    kind: "functionapp",
    location: "Australia East",
    name: "d-shp-func-esposter-auea-001",
    outboundVnetRouting: {
      allTraffic: false,
      applicationTraffic: false,
      backupRestoreTraffic: false,
      contentShareTraffic: false,
      imagePullTraffic: false,
    },
    publicNetworkAccess: "Enabled",
    redundancyMode: azure_native.web.RedundancyMode.None,
    reserved: false,
    resourceGroupName: "d-shp-rg-esposter-auea-001",
    scmSiteAlsoStopped: false,
    serverFarmId:
      "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.Web/serverfarms/ASP-dshprgesposterauea001-94fb",
    storageAccountRequired: false,
    tags: {
      Application: "Esposter",
      "hidden-link: /app-insights-resource-id":
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/microsoft.insights/components/d-shp-appi-esposter-auea-001",
    },
  },
  {
    protect: true,
  },
);
