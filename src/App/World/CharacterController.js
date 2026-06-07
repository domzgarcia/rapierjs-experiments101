// Import necessary modules
import * as THREE from "three";
import App from "../App.js";
import { inputStore } from "../Utils/Store.js";

/**
 * Class representing a character controller.
 */
export default class CharacterController {
  /**
   * Create a character controller.
   */
  constructor() {
    // Initialize app, scene, physics, and character properties
    this.app = App.getInstance();
    this.scene = this.app.scene;
    this.physics = this.app.world.physics;
    this.character = this.app.world.character.instance;

    // Subscribe to input store and update movement values
    inputStore.subscribe((state) => {
      this.forward = state.forward;
      this.backward = state.backward;
      this.left = state.left;
      this.right = state.right;
      this.hiphop = state.hiphop;
      this.windmill = state.windmill;
    });

    // Instantiate controller and create rigid body and collider
    this.instantiateController();
  }

  /**
   * Instantiate the character controller, rigid body, and collider.
   */
  instantiateController() {
    // Create a kinematic rigid body
    this.rigidBodyType =
      this.physics.rapier.RigidBodyDesc.kinematicPositionBased();
    this.rigidBody = this.physics.world.createRigidBody(this.rigidBodyType);

    // Create a capsule collider for smoother, rounded slope collision
    const radius = 0.6;
    const halfHeight = 2.0;
    this.colliderType = this.physics.rapier.ColliderDesc.capsule(radius, halfHeight);
    this.collider = this.physics.world.createCollider(
      this.colliderType,
      this.rigidBody
    );

    // Set rigid body position to character position
    const worldPosition = this.character.getWorldPosition(new THREE.Vector3());
    const worldRotation = this.character.getWorldQuaternion(
      new THREE.Quaternion()
    );
    this.rigidBody.setTranslation(worldPosition);
    this.rigidBody.setRotation(worldRotation);

    // Create character controller, set properties, and enable autostepping
    this.characterController =
      this.physics.world.createCharacterController(0.01);
    this.characterController.setApplyImpulsesToDynamicBodies(true);
    this.characterController.enableAutostep(3.0, 0.5, false);
    this.characterController.enableSnapToGround(2.5);
  }

  /**
   * Loop function that updates the character's position and movement.
   */
  loop() {
    // Initialize movement vector based on input values
    const movement = new THREE.Vector3();

    if (this.hiphop || this.windmill) return;

    if (this.forward) {
      movement.z -= 1;
    }
    if (this.backward) {
      movement.z += 1;
    }
    if (this.left) {
      movement.x -= 1;
    }
    if (this.right) {
      movement.x += 1;
    }

    // Convert input movement to camera-relative world movement
    if (movement.lengthSq() !== 0 && this.app.camera?.instance) {
      const cameraForward = new THREE.Vector3();
      this.app.camera.instance.getWorldDirection(cameraForward);
      cameraForward.y = 0;
      cameraForward.normalize();

      const cameraRight = new THREE.Vector3();
      cameraRight.crossVectors(cameraForward, new THREE.Vector3(0, 1, 0)).normalize();

      const worldMovement = new THREE.Vector3();
      worldMovement.addScaledVector(cameraRight, movement.x);
      worldMovement.addScaledVector(cameraForward, -movement.z);

      if (worldMovement.lengthSq() !== 0) {
        worldMovement.normalize();
        const characterRotation = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          worldMovement
        );
        this.character.quaternion.slerp(characterRotation, 0.1);
      }

      movement.copy(worldMovement);
    }

    // Normalize and scale movement vector; let the controller handle stepping and grounding
    movement.normalize().multiplyScalar(0.3);
    movement.y = -0.25;

    // Update collider movement and get new position of rigid body
    this.characterController.computeColliderMovement(this.collider, movement);
    const newPosition = new THREE.Vector3()
      .copy(this.rigidBody.translation())
      .add(this.characterController.computedMovement());

    // Set next kinematic translation of rigid body and update character position
    this.rigidBody.setNextKinematicTranslation(newPosition);
    this.character.position.lerp(this.rigidBody.translation(), 0.2);
  }
}
