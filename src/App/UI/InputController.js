import { inputStore } from "../Utils/Store";
import * as THREE from "three";

export default class InputController {
  constructor() {
    this.startListening();
    this.startJoystick();
    this.inputStore = inputStore;
    this.keyPressed = {};
    this.dragActive = false;
    this.activePointerId = null;
  }

  startListening() {
    window.addEventListener("keydown", (event) => {
      this.onKeyDown(event);
    });

    window.addEventListener("keyup", (event) => {
      this.onKeyUp(event);
    });
  }

  startJoystick() {
    this.joystick = document.getElementById("joystick");
    if (!this.joystick) return;
    this.joystickBase = this.joystick.querySelector(".joystick-base");
    this.joystickStick = this.joystick.querySelector(".joystick-stick");

    const onPointerDown = (event) => {
      if (this.dragActive) return;
      event.preventDefault();
      this.dragActive = true;
      this.activePointerId = event.pointerId;
      this.joystick.setPointerCapture(event.pointerId);
      this.updateJoystick(event.clientX, event.clientY);
    };

    const onPointerMove = (event) => {
      if (!this.dragActive || event.pointerId !== this.activePointerId) return;
      event.preventDefault();
      this.updateJoystick(event.clientX, event.clientY);
    };

    const onPointerUp = (event) => {
      if (!this.dragActive || event.pointerId !== this.activePointerId) return;
      event.preventDefault();
      this.dragActive = false;
      this.activePointerId = null;
      if (this.joystick.releasePointerCapture) {
        this.joystick.releasePointerCapture(event.pointerId);
      }
      this.resetJoystick();
    };

    this.joystick.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }

  updateJoystick(clientX, clientY) {
    const rect = this.joystick.getBoundingClientRect();
    const center = new THREE.Vector2(rect.left + rect.width / 2, rect.top + rect.height / 2);
    const point = new THREE.Vector2(clientX, clientY);
    const delta = new THREE.Vector2().subVectors(point, center);
    const maxRadius = rect.width * 0.4;
    const distance = Math.min(delta.length(), maxRadius);
    const direction = delta.clone().setLength(distance);

    this.joystickStick.style.transform = `translate(-50%, -50%) translate(${direction.x}px, ${direction.y}px)`;

    const normalized = direction.clone().divideScalar(maxRadius);
    this.setJoystickDirection(normalized.x, normalized.y);
  }

  resetJoystick() {
    if (this.joystickStick) {
      this.joystickStick.style.transform = "translate(-50%, -50%)";
    }
    this.setJoystickDirection(0, 0);
  }

  setJoystickDirection(x, y) {
    const threshold = 0.25;
    inputStore.setState({
      forward: y < -threshold,
      backward: y > threshold,
      left: x < -threshold,
      right: x > threshold,
    });
  }

  onKeyDown(event) {
    if (this.keyPressed[event.code]) return;

    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        inputStore.setState({ forward: true });
        break;
      case "KeyA":
      case "ArrowLeft":
        inputStore.setState({ left: true });
        break;
      case "KeyS":
      case "ArrowDown":
        inputStore.setState({ backward: true });
        break;
      case "KeyD":
      case "ArrowRight":
        inputStore.setState({ right: true });
        break;
      case "KeyZ":
        inputStore.setState({ hiphop: true });
        break;
      case "KeyX":
        inputStore.setState({ windmill: true });
        break;
    }
    this.keyPressed[event.code] = true;
  }

  onKeyUp(event) {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        inputStore.setState({ forward: false });
        break;
      case "KeyA":
      case "ArrowLeft":
        inputStore.setState({ left: false });
        break;
      case "KeyS":
      case "ArrowDown":
        inputStore.setState({ backward: false });
        break;
      case "KeyD":
      case "ArrowRight":
        inputStore.setState({ right: false });
        break;
      case "KeyZ":
        inputStore.setState({ hiphop: false });
        break;
      case "KeyX":
        inputStore.setState({ windmill: false });
        break;
    }
    this.keyPressed[event.code] = false;
  }
}
