import type { ServiceBusSender } from "@azure/service-bus";
import type { AzureQueue } from "@esposter/db-schema";

import { MockServiceBusSender } from "azure-mock";
import { describe } from "vitest";

export const useServiceBusSender = (azureQueue: AzureQueue): ServiceBusSender => new MockServiceBusSender(azureQueue);

describe.todo("useServiceBusSender");
