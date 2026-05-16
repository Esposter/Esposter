import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

interface AzureAssetRow {
  readonly assetType: string;
  readonly environment: string;
  readonly region: string;
  readonly resourceGroup: string;
  readonly resourceName: string;
  readonly scope: string;
  readonly subscription: string;
}

interface AzureAssetMapping {
  readonly providerPath: string;
  readonly type: string;
}

interface ImportResource {
  readonly id: string;
  readonly name: string;
  readonly type: string;
}

interface ImportReviewItem extends AzureAssetRow {
  readonly reason: string;
}

const AssetImportMappingByAssetTypeMap: Readonly<Record<string, AzureAssetMapping>> = {
  "AI and Machine Learning: Azure Cognitive Search": {
    providerPath: "Microsoft.Search/searchServices",
    type: "azure-native:search:Service",
  },
  "AI and Machine Learning: Azure Cognitive Speech Services": {
    providerPath: "Microsoft.CognitiveServices/accounts",
    type: "azure-native:cognitiveservices:Account",
  },
  "Analytics and IoT: Event Grid Topic": {
    providerPath: "Microsoft.EventGrid/topics",
    type: "azure-native:eventgrid:Topic",
  },
  "Compute and Web: Function app": {
    providerPath: "Microsoft.Web/sites",
    type: "azure-native:web:WebApp",
  },
  "Compute and Web: Web PubSub": {
    providerPath: "Microsoft.SignalRService/webPubSub",
    type: "azure-native:webpubsub:WebPubSub",
  },
  "General: Resource group": {
    providerPath: "",
    type: "azure-native:resources:ResourceGroup",
  },
  "Integration: Logic apps": {
    providerPath: "Microsoft.Logic/workflows",
    type: "azure-native:logic:Workflow",
  },
  "Management and governance: Application Insights": {
    providerPath: "Microsoft.Insights/components",
    type: "azure-native:insights:Component",
  },
  "Management and governance: Azure Monitor action group": {
    providerPath: "Microsoft.Insights/actionGroups",
    type: "azure-native:insights:ActionGroup",
  },
  "Management and governance: Log Analytics workspace": {
    providerPath: "Microsoft.OperationalInsights/workspaces",
    type: "azure-native:operationalinsights:Workspace",
  },
  "Networking: API connection": {
    providerPath: "Microsoft.Web/connections",
    type: "azure-native:web:Connection",
  },
  "Storage: Storage account": {
    providerPath: "Microsoft.Storage/storageAccounts",
    type: "azure-native:storage:StorageAccount",
  },
} as const;

const inputFilePath = resolve(process.argv[2] ?? "data/Azure Assets - Assets.csv");
const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID ?? process.argv[3] ?? "<subscription-id>";
const outputManifestPath = resolve("generated/azure-import-manifest.json");
const outputReviewPath = resolve("generated/azure-import-review.md");

const parseCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let value = "";
  let isInsideQuotes = false;

  for (const character of line) {
    if (character === '"') {
      isInsideQuotes = !isInsideQuotes;
    } else if (character === "," && !isInsideQuotes) {
      values.push(value);
      value = "";
    } else {
      value += character;
    }
  }

  values.push(value);
  return values.map((csvValue) => csvValue.trim());
};

const getUniqueHeaders = (headers: readonly string[]): string[] => {
  const headerCountByNameMap = new Map<string, number>();
  const uniqueHeaders: string[] = [];

  for (const header of headers) {
    const headerCount = headerCountByNameMap.get(header) ?? 0;
    headerCountByNameMap.set(header, headerCount + 1);
    uniqueHeaders.push(headerCount === 0 ? header : `${header} ${headerCount + 1}`);
  }

  return uniqueHeaders;
};

const parseAssetRows = (csv: string): AzureAssetRow[] => {
  const lines = csv.split(/\r?\n/u).filter((line) => line.length > 0);
  const headerLine = lines.at(0);

  if (headerLine === undefined) return [];

  const headers = getUniqueHeaders(parseCsvLine(headerLine));
  const rows: AzureAssetRow[] = [];

  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
    const resourceName = row["Resource Name"] ?? "";
    const assetType = row["Asset Type"] ?? "";

    if (resourceName.length === 0 || assetType === "STOP") continue;

    rows.push({
      assetType,
      environment: row.Environment ?? "",
      region: row.Region ?? "",
      resourceGroup: row["Resource Group"] ?? "",
      resourceName,
      scope: row.Scope ?? "",
      subscription: row.Subscription ?? "",
    });
  }

  return rows;
};

const getResourceId = (assetRow: AzureAssetRow, mapping: AzureAssetMapping) => {
  if (mapping.providerPath.length === 0)
    return `/subscriptions/${subscriptionId}/resourceGroups/${assetRow.resourceName}`;

  return `/subscriptions/${subscriptionId}/resourceGroups/${assetRow.resourceGroup}/providers/${mapping.providerPath}/${assetRow.resourceName}`;
};

const getImportResources = (assetRows: readonly AzureAssetRow[]) => {
  const importResources: ImportResource[] = [];
  const reviewItems: ImportReviewItem[] = [];

  for (const assetRow of assetRows) {
    const mapping = AssetImportMappingByAssetTypeMap[assetRow.assetType];

    if (mapping === undefined) {
      reviewItems.push({ ...assetRow, reason: "No Pulumi token mapping yet." });
      continue;
    }

    importResources.push({
      id: getResourceId(assetRow, mapping),
      name: assetRow.resourceName,
      type: mapping.type,
    });
  }

  return { importResources, reviewItems };
};

const getReviewMarkdown = (
  assetRows: readonly AzureAssetRow[],
  importResources: readonly ImportResource[],
  reviewItems: readonly ImportReviewItem[],
) => {
  const lines = [
    "# Azure Import Review",
    "",
    `Source: ${basename(inputFilePath)}`,
    `Total CSV resources: ${assetRows.length}`,
    `Ready for Pulumi bulk import: ${importResources.length}`,
    `Needs manual review: ${reviewItems.length}`,
    "",
    "## Manual Review",
    "",
  ];

  if (reviewItems.length === 0) {
    lines.push("No manual review items.");
  } else {
    lines.push("| Resource | Asset type | Reason |");
    lines.push("| --- | --- | --- |");

    for (const reviewItem of reviewItems) {
      lines.push(`| ${reviewItem.resourceName} | ${reviewItem.assetType} | ${reviewItem.reason} |`);
    }
  }

  return `${lines.join("\n")}\n`;
};

const csv = await readFile(inputFilePath, "utf8");
const assetRows = parseAssetRows(csv);
const { importResources, reviewItems } = getImportResources(assetRows);

await mkdir(dirname(outputManifestPath), { recursive: true });
await writeFile(outputManifestPath, `${JSON.stringify({ resources: importResources }, undefined, 2)}\n`);
await writeFile(outputReviewPath, getReviewMarkdown(assetRows, importResources, reviewItems));

console.log(`Read ${assetRows.length} Azure assets from ${inputFilePath}.`);
console.log(`Wrote ${importResources.length} import resources to ${outputManifestPath}.`);
console.log(`Wrote ${reviewItems.length} review items to ${outputReviewPath}.`);
