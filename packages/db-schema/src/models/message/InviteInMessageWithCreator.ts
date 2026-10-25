import type { PublicUser } from "#src/models/user/PublicUser";
import type { InviteInMessage } from "#src/schema/message/invitesInMessage";

// The row plus whoever minted it, which is what a management surface lists — a code with no author beside it
// Says nothing about who to ask when it turns up somewhere it should not have
export type InviteInMessageWithCreator = InviteInMessage & { user: PublicUser };
