import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background
scene.fog = new THREE.Fog(0x87CEEB, 10, 100);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going under ground

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(20, 50, 20);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -30;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -30;
scene.add(directionalLight);

// --- Textures ---
const textureLoader = new THREE.TextureLoader();

const grassTexture = textureLoader.load('textures/grass.png');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(10, 10);

const roadTexture = textureLoader.load('textures/road.png');
roadTexture.wrapS = THREE.RepeatWrapping;
roadTexture.wrapT = THREE.RepeatWrapping;
roadTexture.repeat.set(1, 10);
roadTexture.rotation = Math.PI / 2;

const brickTexture = textureLoader.load('textures/brick.png');
brickTexture.wrapS = THREE.RepeatWrapping;
brickTexture.wrapT = THREE.RepeatWrapping;
brickTexture.repeat.set(2, 2);

const concreteTexture = textureLoader.load('textures/concrete.png');
concreteTexture.wrapS = THREE.RepeatWrapping;
concreteTexture.wrapT = THREE.RepeatWrapping;
concreteTexture.repeat.set(2, 2);

const glassTexture = textureLoader.load('textures/glass.png');
glassTexture.wrapS = THREE.RepeatWrapping;
glassTexture.wrapT = THREE.RepeatWrapping;

// --- Materials ---
const grassMaterial = new THREE.MeshStandardMaterial({
  map: grassTexture,
  roughness: 0.8
});

const roadMaterial = new THREE.MeshStandardMaterial({
  map: roadTexture,
  roughness: 0.9
});

const brickMaterial = new THREE.MeshStandardMaterial({
  map: brickTexture,
  roughness: 0.6
});

const concreteMaterial = new THREE.MeshStandardMaterial({
  map: concreteTexture,
  roughness: 0.7
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  map: glassTexture,
  color: 0xffffff,
  metalness: 0.1,
  roughness: 0.05,
  transmission: 0.9, // Add transparency
  thickness: 0.1, // Add refraction
  transparent: true,
  opacity: 0.8
});

// --- Objects ---

// Ground
const grass = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), grassMaterial);
grass.rotation.x = -Math.PI / 2;
grass.receiveShadow = true;
scene.add(grass);

// Roads
const verticalRoad = new THREE.Mesh(
  new THREE.BoxGeometry(8, 0.1, 60),
  roadMaterial
);
verticalRoad.position.y = 0.05;
verticalRoad.receiveShadow = true;
// Fix road texture rotation for vertical road
const vRoadMat = roadMaterial.clone();
vRoadMat.map = roadTexture.clone();
vRoadMat.map.rotation = 0;
vRoadMat.map.repeat.set(2, 15);
vRoadMat.map.needsUpdate = true;
verticalRoad.material = vRoadMat;
scene.add(verticalRoad);

const horizontalRoad = new THREE.Mesh(
  new THREE.BoxGeometry(60, 0.1, 8),
  roadMaterial
);
horizontalRoad.position.y = 0.06;
horizontalRoad.receiveShadow = true;
// Fix road texture for horizontal road
const hRoadMat = roadMaterial.clone();
hRoadMat.map = roadTexture.clone();
hRoadMat.map.rotation = Math.PI / 2; // Rotate texture 90 deg
hRoadMat.map.repeat.set(15, 2); // Swap repeat
hRoadMat.map.needsUpdate = true;
horizontalRoad.material = hRoadMat;
scene.add(horizontalRoad);

// Buildings
const buildings = [];

// Brick Building
const building1 = new THREE.Mesh(
  new THREE.BoxGeometry(6, 8, 6),
  brickMaterial
);
building1.position.set(-10, 4, -10);
building1.castShadow = true;
building1.receiveShadow = true;
building1.userData = { isBuilding: true, originalColor: 0xffffff };
scene.add(building1);
buildings.push(building1);

// Concrete Building
const building2 = new THREE.Mesh(
  new THREE.BoxGeometry(7, 10, 7),
  concreteMaterial
);
building2.position.set(10, 5, -10);
building2.castShadow = true;
building2.receiveShadow = true;
building2.userData = { isBuilding: true, originalColor: 0xffffff };
scene.add(building2);
buildings.push(building2);

// Glass Building
const building3 = new THREE.Mesh(
  new THREE.BoxGeometry(5, 12, 5),
  glassMaterial
);
building3.position.set(-12, 6, 12);
building3.castShadow = true;
building3.receiveShadow = true;
building3.userData = { isBuilding: true, originalColor: 0xffffff };
scene.add(building3);
buildings.push(building3);

// --- External Model (GLTF) ---
let duckModel = null;
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  'models/Duck.glb',
  (gltf) => {
    duckModel = gltf.scene;
    duckModel.position.set(10, 0.5, 12);
    duckModel.scale.set(2, 2, 2);
    duckModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(duckModel);
  },
  undefined,
  (error) => {
    console.error('An error occurred loading the model:', error);
  }
);

// --- Animation & Interaction Variables ---
let isAnimating = true;

// --- Interactions ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', onMouseClick, false);
window.addEventListener('keydown', onKeyDown, false);
window.addEventListener('resize', onWindowResize, false);

function onMouseClick(event) {
  // Normalize mouse coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(buildings);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    // Interaction: Change color on click
    const randomColor = Math.random() * 0xffffff;
    object.material = object.material.clone(); // Clone to not affect others if shared
    object.material.color.setHex(randomColor);
  }
}

function onKeyDown(event) {
  if (event.key === ' ') { // Spacebar to toggle animation
    isAnimating = !isAnimating;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  // Animation: Rotate Duck
  if (duckModel && isAnimating) {
    duckModel.rotation.y += 0.02;
    // Also simple bobbing animation
    duckModel.position.y = 0.5 + Math.sin(time * 2) * 0.2;
  }

  // Animation: Rotate Glass Building
  if (isAnimating) {
    building3.rotation.y = Math.sin(time * 0.5) * 0.2;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();