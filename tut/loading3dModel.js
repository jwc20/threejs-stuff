import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import cardDeckUrl from "./52-card_deck.glb?url";
import pokerChipSetUrl from "./poker_chip_set.glb?url";
import pokerTableUrl from "./poker_table.glb?url";

const models = [
  { name: "poker table", url: pokerTableUrl, position: [0, 0, 0], scale: 0.001 },
  { name: "52 card deck", url: cardDeckUrl, position: [-0.25, 0.56, 0], scale: 1 },
  { name: "poker chips", url: pokerChipSetUrl, position: [0.25, 0.56, 0], scale: 1 },
];

export function createLoading3dModelScene(container) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const loader = new GLTFLoader();
  const status = document.createElement("p");

  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  status.className = "model-status";
  status.textContent = "Loading poker table, 52 card deck, and poker chips...";
  container.appendChild(status);

  scene.background = new THREE.Color(0x20232a);
  camera.position.set(0, 1.5, 6);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
  controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
  controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
  controls.target.set(0, 0, 0);
  renderer.domElement.classList.add("orbit-canvas");

  function startDrag() {
    renderer.domElement.classList.add("is-dragging");
  }

  function stopDrag() {
    renderer.domElement.classList.remove("is-dragging");
  }

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  const placeholderGeometry = new THREE.BoxGeometry(2, 2, 2);
  const placeholderMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, wireframe: true });
  const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
  scene.add(placeholder);

  const modelGroup = new THREE.Group();
  scene.add(modelGroup);
  let isDisposed = false;

  loadModels();

  async function loadModels() {
    const results = await Promise.all(
      models.map(async (model) => {
        try {
          const gltf = await loader.loadAsync(model.url);
          gltf.scene.scale.setScalar(model.scale);
          normalizeModel(gltf.scene);
          gltf.scene.position.add(new THREE.Vector3(...model.position));
          return { ...model, scene: gltf.scene };
        } catch {
          return { ...model, scene: null };
        }
      }),
    );

    if (isDisposed) {
      return;
    }

    const loaded = results.filter((result) => result.scene);

    if (loaded.length > 0) {
      scene.remove(placeholder);
      loaded.forEach((result) => modelGroup.add(result.scene));
      frameObject(modelGroup, camera, controls);
    }

    if (loaded.length === models.length) {
      status.textContent = "Loaded poker table, 52 card deck, and poker chips.";
    } else if (loaded.length > 0) {
      const loadedNames = loaded.map((result) => result.name).join(", ");
      const failedNames = results
        .filter((result) => !result.scene)
        .map((result) => result.name)
        .join(", ");
      status.textContent = `Loaded ${loadedNames}. Failed to load ${failedNames}.`;
    } else {
      status.textContent =
        "No models loaded. Check that the GLB files exist in the project root.";
    }
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate(time) {
    placeholder.rotation.x = time / 2000;
    placeholder.rotation.y = time / 1000;

    controls.update();
    renderer.render(scene, camera);
  }

  window.addEventListener("resize", resize);
  renderer.domElement.addEventListener("pointerdown", startDrag);
  window.addEventListener("pointerup", stopDrag);
  window.addEventListener("pointercancel", stopDrag);
  renderer.setAnimationLoop(animate);

  return () => {
    isDisposed = true;
    window.removeEventListener("resize", resize);
    renderer.domElement.removeEventListener("pointerdown", startDrag);
    window.removeEventListener("pointerup", stopDrag);
    window.removeEventListener("pointercancel", stopDrag);
    renderer.setAnimationLoop(null);
    placeholderGeometry.dispose();
    placeholderMaterial.dispose();
    controls.dispose();
    renderer.dispose();
  };
}

function frameObject(object, camera, controls) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());

  object.position.sub(center);
  camera.near = Math.max(size / 1000, 0.01);
  camera.far = Math.max(size * 10, 1000);
  camera.updateProjectionMatrix();
  camera.position.set(0, size * 0.2, size * 1.2 || 6);
  controls.target.set(0, 0, 0);
  controls.update();
}

function normalizeModel(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());

  object.position.x -= center.x;
  object.position.y -= box.min.y;
  object.position.z -= center.z;
}
