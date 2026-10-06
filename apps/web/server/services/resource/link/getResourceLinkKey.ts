import type { ResourceLinkTarget } from "#server/models/resource/link/ResourceLinkTarget";

import { ID_SEPARATOR } from "@esposter/shared";

// One string per link, which is what a set of them is compared and deduplicated by
export const getResourceLinkKey = ({ targetId, type }: ResourceLinkTarget) => `${type}${ID_SEPARATOR}${targetId}`;
