import type { PublicUser } from "#src/models/user/PublicUser";
import type { BlockInSocial } from "#src/schema/social/blocksInSocial";

export type BlockInSocialWithRelations = BlockInSocial & { blocked: PublicUser };
