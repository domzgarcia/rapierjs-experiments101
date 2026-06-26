import * as THREE from "three";
import assetStore from "../Utils/AssetStore.js";

import App from "../App.js";
export default class Character {
  constructor() {
    this.app = App.getInstance();
    this.scene = this.app.scene;
    this.assetStore = assetStore.getState();
    this.avatar = this.assetStore.loadedAssets.avatar;

    this.instantiateCharacter();
  }

  instantiateCharacter() {
    // create character and add to scene
    const geometry = new THREE.BoxGeometry(2, 5, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      wireframe: true,
      visible: false, // Set to false to hide the box collider mesh
    });
    this.instance = new THREE.Mesh(geometry, material);
    this.instance.position.set(0, 20, 0);
    this.instance.castShadow = false;
    this.scene.add(this.instance);

    // add avatar to character
    const avatar = this.avatar.scene;
    avatar.scale.setScalar(3);
    avatar.updateMatrixWorld(true);

    // Align the avatar's lowest point to the character's expected foot level
    const avatarBounds = new THREE.Box3().setFromObject(avatar);
    const colliderBottomOffset = -(1.8 + 0.5); // halfHeight + radius from CharacterController
    avatar.position.y = colliderBottomOffset - avatarBounds.min.y;

    avatar.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    this.instance.add(avatar);
  }
}
