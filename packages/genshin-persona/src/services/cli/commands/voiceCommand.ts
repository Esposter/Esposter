import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { VoiceStatus } from "#src/models/VoiceStatus";
import { checkHasWeights } from "#src/services/checkHasWeights";
import { checkIsRuntimeInstalled } from "#src/services/checkIsRuntimeInstalled";
import { checkIsVoiceLanguage } from "#src/services/checkIsVoiceLanguage";
import { getCurrentCharacter } from "#src/services/cli/getCurrentCharacter";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { connectVoiceServer } from "#src/services/connectVoiceServer";
import {
  MODELS_DIRECTORY,
  RUNTIME_MANIFEST_PATH,
  VOICE_CPU_DEVICE,
  VOICE_LOG_PATH,
  VOICE_PROOF_TEXT,
  VOICE_STATUS_SEPARATOR,
  VoiceLanguageNameMap,
} from "#src/services/constants";
import { createVoiceProgressPrinter } from "#src/services/createVoiceProgressPrinter";
import { createVoiceSynthesizer } from "#src/services/createVoiceSynthesizer";
import { deleteVoiceDevice } from "#src/services/deleteVoiceDevice";
import { getSpeechRequest } from "#src/services/getSpeechRequest";
import { getWarmRequest } from "#src/services/getWarmRequest";
import { installVoiceRuntime } from "#src/services/installVoiceRuntime";
import { readCharacterReference } from "#src/services/readCharacterReference";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readVoiceDevice } from "#src/services/readVoiceDevice";
import { readVoiceLanguage } from "#src/services/readVoiceLanguage";
import { readVoiceRuntime } from "#src/services/readVoiceRuntime";
import { sendVoiceRequest } from "#src/services/sendVoiceRequest";
import { writeVoiceLanguage } from "#src/services/writeVoiceLanguage";
import { defineCommand } from "citty";

export const voiceCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Voice },
  run: async ({ args }) => {
    const context = await readGenshinContext();
    const { listFormat, strings } = context;
    const name = args._.join(" ");
    if (!name) {
      const voiceLanguage = readVoiceLanguage();
      console.log(
        voiceLanguage
          ? strings.voiceStatus(checkIsRuntimeInstalled(), voiceLanguage, readVoiceDevice(), VOICE_LOG_PATH)
          : strings.voiceUnset,
      );
      return;
    }

    if (!checkIsVoiceLanguage(name)) {
      console.error(strings.voiceLanguageMustBeOneOf(listFormat.format(Object.keys(VoiceLanguageNameMap))));
      process.exitCode = 1;
      return;
    }
    // The proof walks the device ladder from the top, so a rung this machine once demoted is tried again here and
    // Nowhere else: the rung on file is cleared, and a synthesizer still running — on that rung, or on the runtime
    // Being replaced — is stopped, so the one the warm spawns loads afresh
    deleteVoiceDevice();
    await connectVoiceServer({ type: VoiceRequestType.Stop });
    if (checkIsRuntimeInstalled()) console.log(strings.runtimeInstalled);
    else {
      console.log(strings.runtimeInstalling);
      if (!installVoiceRuntime()) {
        console.error(strings.runtimeInstallFailed);
        process.exitCode = 1;
        return;
      }
    }
    // The runtime's own loader fetches what it is asked to load into the models directory, so the weights are
    // Downloaded by loading the engine once here — with progress, which the detached synthesizer cannot print —
    // And the synthesizer then loads them from the cache inside a hook's budget. A cache already holding them skips
    // The load, since the rung the engine speaks on is the proof's to report
    if (checkHasWeights(MODELS_DIRECTORY)) console.log(strings.weightsPresent);
    else {
      const runtime = readVoiceRuntime(RUNTIME_MANIFEST_PATH);
      const synthesizer = await createVoiceSynthesizer(runtime, MODELS_DIRECTORY, {
        onFallback: console.log,
        onProgress: createVoiceProgressPrinter(),
      });
      console.log(
        synthesizer.device === VOICE_CPU_DEVICE ? strings.weightsOnCpu : strings.weightsOnDevice(synthesizer.device),
      );
    }
    // The dub on disk is the gate every spoken reply passes, so it is written only where this run proved the
    // Voice — a setup that failed after it leaves the replies silent rather than broken in the hooks' silence
    const character = await getCurrentCharacter(context);
    if (!character) {
      writeVoiceLanguage(name);
      console.log(strings.voiceLanguageWritten(name));
      return;
    }

    const personaCard = await readPersonaCard(character.name);
    if (!readCharacterReference(character.name, personaCard)) console.log(strings.noReference(character.displayName));

    const warmed = await sendVoiceRequest(getWarmRequest(character.name, personaCard, name));
    const [status, device] = warmed.split(VOICE_STATUS_SEPARATOR);
    if (status !== VoiceStatus.Ok) {
      console.error(strings.warmRequestUnanswered(status || "unreachable", VOICE_LOG_PATH));
      process.exitCode = 1;
      return;
    }

    writeVoiceLanguage(name);
    await sendVoiceRequest(
      getSpeechRequest(VoiceRequestType.Speak, character.name, personaCard, name, [VOICE_PROOF_TEXT]),
    );
    console.log(strings.spoke(character.displayName, device ?? ""));
  },
});
