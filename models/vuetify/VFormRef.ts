import { VForm } from "vuetify/components";

export type VFormRef = typeof VForm & { errors: { id: string; errorMessages: string[] }[] };
