import * as THREE from "three";

export function createLineScene(container) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);

  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const points = [
    new THREE.Vector3(-10, 0, 0),
    new THREE.Vector3(0, 10, 0),
    new THREE.Vector3(10, 0, 0),
  ];

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  }

  function animate() {
    renderer.render(scene, camera);
  }

  window.addEventListener("resize", resize);
  renderer.setAnimationLoop(animate);

  return () => {
    window.removeEventListener("resize", resize);
    renderer.setAnimationLoop(null);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}
