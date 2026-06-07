import * as THREE from "three";
import Stats from "stats.js";
import App from "../App";

export default class Loop {
  constructor() {
    console.log("Loop Init");
    this.app = App.getInstance();
    this.camera = this.app.camera;
    this.renderer = this.app.renderer;
    this.world = this.app.world;

    this.clock = new THREE.Clock();
    this.previousElapsedTime = 0;
    this.targetFrameDuration = 1 / 60;
    this.accumulatedTime = 0;
    this.maxAccumulatedTime = 0.25;

    this.setStats();
    this.loop();
  }

  setStats() {
    if (typeof document === "undefined") return;

    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb
    this.stats.dom.style.position = "fixed";
    this.stats.dom.style.left = "0px";
    this.stats.dom.style.top = "0px";
    this.stats.dom.style.zIndex = "9999";
    document.body.appendChild(this.stats.dom);
  }

  loop() {
    const elapsedTime = this.clock.getElapsedTime();
    let deltaTime = elapsedTime - this.previousElapsedTime;
    this.previousElapsedTime = elapsedTime;

    if (deltaTime > this.maxAccumulatedTime) {
      deltaTime = this.maxAccumulatedTime;
    }

    this.accumulatedTime += deltaTime;

    while (this.accumulatedTime >= this.targetFrameDuration) {
      this.accumulatedTime -= this.targetFrameDuration;

      if (this.stats) this.stats.begin();

      const stepElapsedTime = elapsedTime - this.accumulatedTime;
      this.world.loop(this.targetFrameDuration, stepElapsedTime);
      this.camera.loop();
      this.renderer.loop();

      if (this.stats) this.stats.end();
    }

    window.requestAnimationFrame(() => this.loop());
  }
}
