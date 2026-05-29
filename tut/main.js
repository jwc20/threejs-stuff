import { createCubeScene } from "./cube.js";
import { createLineScene } from "./line.js";
import { createLoading3dModelScene } from "./loading3dModel.js";

const app = document.querySelector("#app");
const select = document.querySelector("#example-select");

const scenes = {
  cube: createCubeScene,
  line: createLineScene,
  loading3dModel: createLoading3dModelScene,
};

let cleanupScene = () => {};

function loadScene(name) {
  cleanupScene();
  app.replaceChildren();

  cleanupScene = scenes[name](app);
}

select.addEventListener("change", () => {
  loadScene(select.value);
});

loadScene(select.value);
