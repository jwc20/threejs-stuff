import * as THREE from "three";

export function createCubeScene(container) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 5;

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate(time) {
    cube.rotation.x = time / 2000;
    cube.rotation.y = time / 1000;

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
