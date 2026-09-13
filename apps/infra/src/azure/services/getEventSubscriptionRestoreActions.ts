import type { ApiConnectionAction } from "#src/azure/models/ApiConnectionAction";
import type { EventSubscriptionRestoreOptions } from "#src/azure/models/EventSubscriptionRestoreOptions";

import AzureEventGridApiVersion from "#src/azure/constants/AzureEventGridApiVersion";
import { HttpMethod } from "#src/azure/models/HttpMethod";
import { WorkflowActionStatus } from "#src/azure/models/WorkflowActionStatus";
import { getApiConnectionAction } from "#src/azure/services/getApiConnectionAction";
import { getAzureFunctionEventSubscriptionArguments } from "#src/azure/services/getAzureFunctionEventSubscriptionArguments";
import { getEventSubscriptionBody } from "#src/azure/services/getEventSubscriptionBody";
import { getEventSubscriptionResourcePath } from "#src/azure/services/getEventSubscriptionResourcePath";

// Each target is read first and recreated only when the read does not succeed, so a subscription the guard never
// Deleted is left untouched. Any failed or timed-out read gates the PUT, not a 404 alone: the body is the declared
// State, so a write after a throttled or timed-out read re-asserts what is already there, and a read the identity's
// Roles reject fails the write the same way — a 404 gate would buy an If and a Terminate action for no different
// Outcome. TimedOut is named beside Failed because the workflow language keeps them apart: gated on Failed alone,
// The PUT is skipped after a timed-out read and the subscription stays down until the next cycle
export const getEventSubscriptionRestoreActions = ({
  connection,
  deadLetterContainer,
  resourceGroup,
  site,
  storageAccount,
  targets,
  topic,
}: EventSubscriptionRestoreOptions): Record<string, ApiConnectionAction> =>
  Object.fromEntries(
    targets.flatMap(({ azureFunction, eventSubscription }) => {
      const path = getEventSubscriptionResourcePath(resourceGroup, topic, eventSubscription);
      const queries = { "x-ms-api-version": AzureEventGridApiVersion };
      const readKey = `Read_${azureFunction}_Event_Subscription`;
      const eventSubscriptionArguments = getAzureFunctionEventSubscriptionArguments(
        azureFunction,
        site,
        storageAccount,
        deadLetterContainer,
      );
      const body = getEventSubscriptionBody(eventSubscriptionArguments);
      return [
        [
          `Create_${azureFunction}_Event_Subscription`,
          getApiConnectionAction({
            body,
            connection,
            method: HttpMethod.Put,
            path,
            queries,
            runAfter: { [readKey]: [WorkflowActionStatus.Failed, WorkflowActionStatus.TimedOut] },
          }),
        ],
        [readKey, getApiConnectionAction({ connection, method: HttpMethod.Get, path, queries })],
      ];
    }),
  );
