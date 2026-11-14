import type { RealtimeKitPreset } from "#src/models/realtimeKit/RealtimeKitPreset";

// RealtimeKit's publish enum for one source. A source a preset does not allow is refused outright rather than requested
const getCanProduce = (isAllowed: boolean): string => (isAllowed ? "ALLOWED" : "NOT_ALLOWED");

// The body the REST API creates a preset from. Its participant features are all off: the calls code runs its own
// Chat, moderation and polls, and kicks through the REST API with the server's token, so the preset grants none of them.
// Camera is ALLOWED in every preset, since no moderation takes it away
export const getRealtimeKitPresetBody = (preset: RealtimeKitPreset) => ({
  config: {
    max_screenshare_count: 1,
    max_video_streams: { desktop: 12, mobile: 4 },
    media: { screenshare: { frame_rate: 30, quality: "hd" }, video: { frame_rate: 30, quality: "hd" } },
    view_type: "GROUP_CALL",
  },
  name: preset.name,
  permissions: {
    accept_waiting_requests: false,
    can_accept_production_requests: false,
    can_change_participant_permissions: false,
    can_edit_display_name: false,
    can_livestream: false,
    can_record: false,
    can_spotlight: false,
    chat: {
      private: { can_receive: false, can_send: false, files: false, text: false },
      public: { can_send: false, files: false, text: false },
    },
    connected_meetings: {
      can_alter_connected_meetings: false,
      can_switch_connected_meetings: false,
      can_switch_to_parent_meeting: false,
    },
    disable_participant_audio: false,
    disable_participant_screensharing: false,
    disable_participant_video: false,
    hidden_participant: false,
    kick_participant: false,
    media: {
      audio: { can_produce: getCanProduce(preset.isMicrophoneAllowed) },
      screenshare: { can_produce: getCanProduce(preset.isScreenshareAllowed) },
      video: { can_produce: "ALLOWED" },
    },
    pin_participant: false,
    plugins: { can_close: false, can_edit_config: false, can_start: false, config: {} },
    polls: { can_create: false, can_view: false, can_vote: false },
    recorder_type: "NONE",
    show_participant_list: true,
    waiting_room_type: "SKIP",
  },
  ui: {
    design_tokens: {
      border_radius: "rounded",
      border_width: "thin",
      colors: {
        background: { "600": "#6b7280", "700": "#4b5563", "800": "#374151", "900": "#1f2937", "1000": "#111827" },
        brand: { "300": "#a5b4fc", "400": "#818cf8", "500": "#6366f1", "600": "#4f46e5", "700": "#4338ca" },
        danger: "#ef4444",
        success: "#22c55e",
        text: "#f9fafb",
        text_on_brand: "#ffffff",
        video_bg: "#000000",
        warning: "#f59e0b",
      },
      spacing_base: 4,
      theme: "dark",
    },
  },
});
