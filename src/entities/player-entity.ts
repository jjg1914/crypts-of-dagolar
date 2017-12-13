import { merge } from "lodash";

import {
  ControlData,
  ControlComponent,
  AnimationData,
  AnimationComponent,
  Control4WaySystem,
  MoveSystem,
  AccelSystem,
  RestrictSystem,
  AnimationSystem,
  SimpleEntity,
  SimpleEntityConfig,
} from "mu-engine";

export interface PlayerEntityConfig extends SimpleEntityConfig {
  control: Partial<ControlData>;
  animation: Partial<AnimationData>;
}

export class PlayerEntity extends SimpleEntity {
  control: ControlData;
  animation: AnimationData;

  constructor(config?: Partial<PlayerEntityConfig>) {
    super(merge({
      position: { width: 12, height: 14 },
      accel: { drag: 256 },
      movement: { restrict: [ 0, 0 ], xMax: 64, yMax: 64 },
      render: {
        transform: [ 1, 0, -10, 0, 1, -10 ],
        sprite: "model.json",
        spriteFrame: 0,
        depth: 1,
      },
    },config));

    this.control = new ControlComponent({
      xAccel: 192,
      yAccel: 192,
    });

    this.animation = new AnimationComponent(merge({
      tag: "stand-right",
    }, config && config.animation));

    AccelSystem(this);
    MoveSystem(this);
    RestrictSystem(this);

    Control4WaySystem(this);

    AnimationSystem(this);

    this.on("start-up", () => {
      this.animation.tag = "walk-up";
    });

    this.on("start-down", () => {
      this.animation.tag = "walk-down";
    });

    this.on("start-right", () => {
      this.animation.tag = "walk-right";
    });

    this.on("start-left", () => {
      this.animation.tag = "walk-left";
    });

    this.on("stop-up", () => {
      this.animation.tag = "stand-up";
    });

    this.on("stop-down", () => {
      this.animation.tag = "stand-down";
    });

    this.on("stop-right", () => {
      this.animation.tag = "stand-right";
    });

    this.on("stop-left", () => {
      this.animation.tag = "stand-left";
    });
  }
}
