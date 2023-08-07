import { AItemEntity } from "@/models/shared/AItemEntity";

export class Survey extends AItemEntity {
  group = "";
  model: object = {};

  constructor(init?: Partial<Survey>) {
    super();
    Object.assign(this, init);
  }
}
