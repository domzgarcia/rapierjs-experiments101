import * as THREE from "three";

import App from "../App.js";

// Used for addding Lights to our scene
export default class Environment {
  constructor() {
    this.app = App.getInstance();
    this.scene = this.app.scene;
    this.physics = this.app.world.physics;

    this.loadEnvironment();
    this.addGround();
    this.addWalls();
    this.addSlope();
    this.addStairs();
    this.addMeshes();
  }

  loadEnvironment() {
    // lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(30, 50, 20);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.set(2048, 2048);
    this.directionalLight.shadow.camera.near = 1;
    this.directionalLight.shadow.camera.far = 200;
    this.directionalLight.shadow.bias = -0.0002;
    this.directionalLight.shadow.camera.left = -100;
    this.directionalLight.shadow.camera.right = 100;
    this.directionalLight.shadow.camera.top = 100;
    this.directionalLight.shadow.camera.bottom = -100;
    this.scene.add(this.directionalLight);
  }

  addGround() {
    const groundGeometry = new THREE.BoxGeometry(500, 1, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: "#e6d2a2", wireframe: false });
    this.groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    this.groundMesh.position.y = -0.5;
    // this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);
    this.physics.add(this.groundMesh, "fixed", "cuboid");
  }

  addWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: "#707070",
      wireframe: false,
    });

    const wallGeometry = new THREE.BoxGeometry(100, 10, 1);

    const wallPositions = [
      { x: 0, y: 5, z: 50 },
      { x: 0, y: 5, z: -50 },
      { x: 50, y: 5, z: 0, rotation: { y: Math.PI / 2 } },
      { x: -50, y: 5, z: 0, rotation: { y: Math.PI / 2 } },
    ];

    wallPositions.forEach((position) => {
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
      wallMesh.position.set(position.x, position.y, position.z);
      if (position.rotation)
        wallMesh.rotation.set(
          position.rotation.x || 0,
          position.rotation.y || 0,
          position.rotation.z || 0
        );
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      this.scene.add(wallMesh);
      this.physics.add(wallMesh, "fixed", "cuboid");
    });
  }

  addStairs() {
    const stairMaterial = new THREE.MeshStandardMaterial({
      color: "#9b5932",
      wireframe: false,
    });

    const stairGeometry = new THREE.BoxGeometry(10, 1, 100);

    const stairPositions = [
      { x: 5, y: 0.5, z: 0 },
      { x: 15, y: 1.5, z: 0 },
      { x: 25, y: 2.5, z: 0 },
      { x: 35, y: 3.5, z: 0 },
      { x: 45, y: 4.5, z: 0 },
    ];

    stairPositions.forEach((position) => {
      const stairMesh = new THREE.Mesh(stairGeometry, stairMaterial);
      stairMesh.position.set(position.x, position.y, position.z);
      // stairMesh.castShadow = true;
      stairMesh.receiveShadow = true;
      this.scene.add(stairMesh);
      this.physics.add(stairMesh, "fixed", "cuboid");
    });
  }

  addSlope() {
    const slopeMaterial = new THREE.MeshStandardMaterial({
      color: "#8c6a3d",
      wireframe: false,
    });

    const slopeGeometry = new THREE.BoxGeometry(60, 1, 20);
    const railGeometry = new THREE.BoxGeometry(60, 4, 1);
    const railMaterial = new THREE.MeshStandardMaterial({ color: "#5a5a5a", wireframe: false });

    const innerSlope = new THREE.Mesh(slopeGeometry, slopeMaterial);
    innerSlope.rotation.z = -Math.PI / 12; // climb from inside toward the left wall
    innerSlope.position.set(-40, 8, 0);
    innerSlope.receiveShadow = true;
    this.scene.add(innerSlope);
    this.physics.add(innerSlope, "fixed", "cuboid");

    const innerRail = new THREE.Mesh(railGeometry, railMaterial);
    innerRail.rotation.z = innerSlope.rotation.z;
    innerRail.position.set(-40, 10, -9.75);
    innerRail.receiveShadow = true;
    this.scene.add(innerRail);
    this.physics.add(innerRail, "fixed", "cuboid");

    const outerSlope = new THREE.Mesh(slopeGeometry, slopeMaterial);
    outerSlope.rotation.z = Math.PI / 12; // descend from the wall toward outside
    outerSlope.position.set(-97.5, 8, 0);
    outerSlope.receiveShadow = true;
    this.scene.add(outerSlope);
    this.physics.add(outerSlope, "fixed", "cuboid");

    const outerRail = new THREE.Mesh(railGeometry, railMaterial);
    outerRail.rotation.z = outerSlope.rotation.z;
    outerRail.position.set(-97.5, 10, 9.75);
    outerRail.receiveShadow = true;
    this.scene.add(outerRail);
    this.physics.add(outerRail, "fixed", "cuboid");
  }

  addMeshes() {
    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: "blue", wireframe: false });

    for (let i = 0; i < 1; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        Math.random() * 3,
        Math.random() + 5 * 3,
        Math.random() * 3
      );

      // mesh.scale.set(
      //   Math.random() + 0.5,
      //   Math.random() + 0.5,
      //   Math.random() + 0.5
      // );

      // mesh.rotation.set(
      //   Math.random() * Math.PI,
      //   Math.random() * Math.PI,
      //   Math.random() * Math.PI
      // );

      this.scene.add(mesh);
      // this.physics.add(mesh, "dynamic", "trimesh");
      // this.physics.add(mesh, "dynamic", "cuboid");
      this.physics.add(mesh, "dynamic", "ball");
    }
  }
}
