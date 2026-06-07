import * as THREE from "three";
import Camera from "./Camera";
import Renderer from "./Renderer";
import Loop from "./Utils/Loop";
import World from "./World/World";
import Resize from "./Utils/Resize";
import AssetLoader from "./Utils/AssetLoader";
import Preloader from "./UI/Preloader";
import InputController from "./UI/InputController";

let instance = null;
export default class App {
  static getInstance() {
    if (!instance) instance = new App();
    return instance;
  }

  constructor() {
    console.log("App Init");
    if (instance) return instance;
    instance = this;

    // Canvas & Scene
    this.canvas = document.querySelector("canvas.threejs");
    this.scene = new THREE.Scene();

    // Load Assets
    this.assetLoader = new AssetLoader();
    this.preLoader = new Preloader();
    this.InputController = new InputController();

    this.userInteracted = false;
    this.updateViewportHeight();
    this.setupFullscreenOnLandscape();
    window.addEventListener("resize", () => this.updateViewportHeight());

    // World
    this.world = new World();

    // Camera & Renderer
    this.camera = new Camera();
    this.renderer = new Renderer();

    // Important Utils
    this.loop = new Loop();
    this.resize = new Resize();

    let lastTouchEnd = 0;

    document.addEventListener('touchend', function (event) {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  }

  updateViewportHeight() {
    document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
  }

  setupFullscreenOnLandscape() {
    const requestFullscreen = async () => {
      if (this.isFullscreen() || !this.isLandscape()) return;
      const element = document.documentElement;
      const request =
        element.requestFullscreen ||
        element.webkitRequestFullscreen ||
        element.mozRequestFullScreen ||
        element.msRequestFullscreen;
      if (request) {
        try {
          await request.call(element);
        } catch (error) {
          console.warn("Fullscreen request blocked:", error);
        }
      }
    };

    const markInteraction = () => {
      this.userInteracted = true;
      if (this.isMobile() && this.isLandscape()) {
        requestFullscreen();
      }
    };

    window.addEventListener("pointerdown", markInteraction, { passive: true });
    window.addEventListener("touchstart", markInteraction, { passive: true });

    window.addEventListener("orientationchange", () => {
      this.updateViewportHeight();
      if (this.userInteracted && this.isMobile() && this.isLandscape()) {
        requestFullscreen();
      }
    });
  }

  isMobile() {
    if (typeof navigator === "undefined") return false;
    return (
      navigator.maxTouchPoints > 0 ||
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
  }

  isLandscape() {
    return (
      window.innerWidth > window.innerHeight ||
      (window.screen?.orientation?.type || "").startsWith("landscape")
    );
  }

  isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }
}
