import { AItemEntity } from "@/models/shared/AItemEntity";

export class Survey extends AItemEntity {
  group?: string;
  model: object = {};
  createdAt = new Date();
  updatedAt = new Date();

  constructor(init?: Partial<Survey>) {
    super();
    Object.assign(this, init);
  }
}
