import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { sizesStore } from "./Utils/Store.js";

import App from "./App.js";

export default class Camera {
  constructor() {
    this.app = App.getInstance();
    this.canvas = this.app.canvas;

    this.sizesStore = sizesStore;

    this.sizes = this.sizesStore.getState();
    this.previousCharacterPosition = null;

    this.setInstance();
    this.setControls();
    this.setResizeListner();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      35,
      this.sizes.width / this.sizes.height,
      1,
      600
    );
    this.instance.position.set(0, 20, 55);
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = 0.5; // 0.9;
    this.controls.enableRotate = true;
    this.controls.rotateSpeed = 0.5; //0.8;
    this.controls.enablePan = false;
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    this.controls.minDistance = 18;
    this.controls.maxDistance = 80;
    this.controls.maxPolarAngle = Math.PI /2 ;// * 0.49;
    this.controls.minPolarAngle = 0;
    this.controls.target.set(0, 2, 0);
  }

  setResizeListner() {
    this.sizesStore.subscribe((sizes) => {
      this.instance.aspect = sizes.width / sizes.height;
      this.instance.updateProjectionMatrix();
    });
  }

  loop() {
    this.characterController = this.app.world.characterController?.rigidBody;
    if (this.characterController) {
      const rawPosition = this.characterController.translation();
      const characterPosition = new THREE.Vector3(
        rawPosition.x,
        rawPosition.y,
        rawPosition.z
      );
      const targetOffset = new THREE.Vector3(0, 2, 0).add(characterPosition);

      if (this.previousCharacterPosition) {
        const movementDelta = new THREE.Vector3()
          .copy(characterPosition)
          .sub(this.previousCharacterPosition);
        this.instance.position.add(movementDelta);
      }

      this.previousCharacterPosition = characterPosition.clone();
      this.controls.target.lerp(targetOffset, 0.1);

      const distance = this.instance.position.distanceTo(this.controls.target);
      const clampedDistance = THREE.MathUtils.clamp(distance, 18, 80);
      if (distance !== clampedDistance) {
        const direction = new THREE.Vector3()
          .subVectors(this.instance.position, this.controls.target)
          .normalize();
        this.instance.position.copy(this.controls.target).add(direction.multiplyScalar(clampedDistance));
      }
    }

    this.controls.update();
  }
}
