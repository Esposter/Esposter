import { AItemEntity } from "@/models/shared/AItemEntity";

export class Survey extends AItemEntity {
  group: string | null = null;
  model = "";

  constructor(init?: Partial<Survey>) {
    super();
    Object.assign(this, init);
  }
}
