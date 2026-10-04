import type { CommandDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { languageCommand } from "#src/services/cli/commands/languageCommand";
import { linesCommand } from "#src/services/cli/commands/linesCommand";
import { muteCommand } from "#src/services/cli/commands/muteCommand";
import { pinCommand } from "#src/services/cli/commands/pinCommand";
import { replyCommand } from "#src/services/cli/commands/replyCommand";
import { rosterCommand } from "#src/services/cli/commands/rosterCommand";
import { statusCommand } from "#src/services/cli/commands/statusCommand";
import { teardownCommand } from "#src/services/cli/commands/teardownCommand";
import { todayCommand } from "#src/services/cli/commands/todayCommand";
import { uncardedCommand } from "#src/services/cli/commands/uncardedCommand";
import { unmuteCommand } from "#src/services/cli/commands/unmuteCommand";
import { unpinCommand } from "#src/services/cli/commands/unpinCommand";
import { untranslatedCommand } from "#src/services/cli/commands/untranslatedCommand";
import { unverbedCommand } from "#src/services/cli/commands/unverbedCommand";
import { useCommand } from "#src/services/cli/commands/useCommand";
import { voiceCommand } from "#src/services/cli/commands/voiceCommand";
import { volumeCommand } from "#src/services/cli/commands/volumeCommand";
import { defineCommand } from "citty";

// The plugin's verbs, each a subcommand; what each does is the README's command reference, and the usage a mistyped
// Verb earns is printed in the interface language by the entry rather than by citty, whose own words are English
export const genshinCommand: CommandDef = defineCommand({
  meta: { name: "genshin" },
  subCommands: {
    [GenshinVerb.Language]: languageCommand,
    [GenshinVerb.Lines]: linesCommand,
    [GenshinVerb.Mute]: muteCommand,
    [GenshinVerb.Pin]: pinCommand,
    [GenshinVerb.Reply]: replyCommand,
    [GenshinVerb.Roster]: rosterCommand,
    [GenshinVerb.Status]: statusCommand,
    [GenshinVerb.Teardown]: teardownCommand,
    [GenshinVerb.Today]: todayCommand,
    [GenshinVerb.Uncarded]: uncardedCommand,
    [GenshinVerb.Unmute]: unmuteCommand,
    [GenshinVerb.Unpin]: unpinCommand,
    [GenshinVerb.Untranslated]: untranslatedCommand,
    [GenshinVerb.Unverbed]: unverbedCommand,
    [GenshinVerb.Use]: useCommand,
    [GenshinVerb.Voice]: voiceCommand,
    [GenshinVerb.Volume]: volumeCommand,
  },
});
