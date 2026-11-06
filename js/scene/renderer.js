// Three.js scene, camera, renderer and the main lights.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

const scene = new THREE.Scene();
scene.background = new THREE.Color(SKY);
scene.fog = new THREE.Fog(SKY, 25, 95);
const cam = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 400);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(innerWidth, innerHeight);
document.body.insertBefore(renderer.domElement, document.body.firstChild);
const hemi = new THREE.HemisphereLight(0xffffff, 0x88aa66, 0.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0.6);
sun.position.set(5, 10, 3);
scene.add(sun);

// the bird (faces -z, away from the camera)
let flapAt = -1e9,
  camL = 1;
const backL = new THREE.PointLight(0xbfdcff, 0.4, 18, 2);
scene.add(backL);
sun.target.position.set(0, -6, -20);
scene.add(sun.target);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
{
  const sc = sun.shadow.camera;
  sc.left = -50;
  sc.right = 50;
  sc.top = 50;
  sc.bottom = -50;
  sc.near = 1;
  sc.far = 140;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.04;
}
