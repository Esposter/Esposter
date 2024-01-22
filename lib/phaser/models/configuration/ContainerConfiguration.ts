import { type Types } from "phaser";
import { type GlobalConfiguration } from "~/lib/phaser/models/configuration/global/GlobalConfiguration";

export type ContainerConfiguration = Types.GameObjects.Container.ContainerConfig & GlobalConfiguration;
