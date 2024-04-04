import { InteractableDirection } from "@/models/dungeons/direction/InteractableDirection";
import { z } from "zod";

export const directionSchema = z.nativeEnum(InteractableDirection) satisfies z.ZodType<InteractableDirection>;
