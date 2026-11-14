import { MicrophoneGateProcessor } from "@/models/message/room/call/MicrophoneGateProcessor";
import { MICROPHONE_GATE_PROCESSOR_NAME } from "@/services/message/room/call/constants";

// The worklet scope's registration, which the DOM library does not declare
declare function registerProcessor(name: string, processorConstructor: typeof MicrophoneGateProcessor): void;

registerProcessor(MICROPHONE_GATE_PROCESSOR_NAME, MicrophoneGateProcessor);
