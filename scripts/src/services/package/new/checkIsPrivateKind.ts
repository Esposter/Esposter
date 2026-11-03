import { PackageKind } from "#src/models/package/PackageKind";

// The one statement of which kinds are private: a plugin is installed by Claude Code rather than published to npm, so its manifest is private, its README has no install step and its published mark is a dash
export const checkIsPrivateKind = (kind: PackageKind): boolean => kind === PackageKind.Plugin;
