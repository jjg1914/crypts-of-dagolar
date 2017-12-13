import { merge } from "lodash";

import {
  SimpleEntity,
  SimpleEntityConfig,
} from "mu-engine";

export interface BlockEntityConfig extends SimpleEntityConfig {
}

export class BlockEntity extends SimpleEntity {
  constructor(config?: Partial<BlockEntityConfig>) {
    super(merge({
      // render: { fill: "#282828" },
      collision: { solid: true },
    }, config));
  }
}
