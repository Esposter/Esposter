import type { UserInAuth } from "@esposter/db-schema";

import { getUserObject } from "#src/services/user/getUserObject";

// The person's own object holds what is theirs outside every room: their reminders, the calls they joined, and the indexes of
// The messages they sent and scheduled. It is emptied, and its alarm cleared, after the rooms those indexes name are swept,
// So a replay finds nothing left to clear
export const eraseAccountUserObject = (userId: UserInAuth["id"]): Promise<void> => getUserObject(userId).erase();
