import type { PushSubscription } from "web-push";

import { useLogoImageUrl } from "#shared/composables/useLogoImageUrl";
import { truncate } from "#shared/util/text/truncate";
import { PUSH_NOTIFICATION_MAX_LENGTH } from "@@/server/services/esposter/constants";
import { sendNotification } from "web-push";

export const useSendCreateMessageNotification = (pushSubscription?: PushSubscription) => {
  const logoImageUrl = useLogoImageUrl();
  return async (title: string, body: string) => {
    if (!pushSubscription) return;
    await sendNotification(
      pushSubscription,
      JSON.stringify({
        body: truncate(body, PUSH_NOTIFICATION_MAX_LENGTH),
        icon: logoImageUrl,
        title,
      }),
    );
  };
};
