import { validateFunctionsEnvironment } from "#src/services/environment/validateFunctionsEnvironment";
import * as baseWebpush from "web-push";

// The VAPID details are set on the first push an isolate sends, from the environment it validated at its start. A Worker's
// module scope runs before that validation, so setting them at import would throw before the missing variable is named
let isConfigured = false;

export const webpush: Pick<typeof baseWebpush, "sendNotification"> = {
  sendNotification: (...args: Parameters<typeof baseWebpush.sendNotification>) => {
    if (!isConfigured) {
      const { BASE_URL, VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY } = validateFunctionsEnvironment();
      baseWebpush.setVapidDetails(BASE_URL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
      isConfigured = true;
    }
    return baseWebpush.sendNotification(...args);
  },
};
