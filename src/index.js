import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

let container;
let camera, scene, renderer;
let controls, draggableObject;

const clickMouse = new THREE.Vector2();
const moveMouse  = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

initScene();
addBox(20,10,15, {x: 0, y: 10, z: 0}, 'white', 'origin', 1, false);
addBox(1,3,0.4, {x: 10, y: 10, z: 10}, 'red', 'item', 1, true);

function initScene() {
  //create dom
  container = document.createElement('div');
  document.body.appendChild(container);

  //camera
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.set(20, 20, 40);

  //scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#838282');

  //main light
  let ambientLight = new THREE.AmbientLight(0xffffff, 0.30);
  let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(-30, 50, 150);
  scene.add(ambientLight);
  scene.add(directionalLight);

  //renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // camera controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.maxPolarAngle = 0.95;
  controls.minPoloarAngle = 2;
  controls.enableDamping = true;
  controls.update();

  //plan
  let floor = new THREE.Mesh(
    new THREE.BoxGeometry(4000, 3, 4000),
    new THREE.MeshBasicMaterial({ color: '#838282' })
  );
  floor.isDraggable = false;
  scene.add(floor);

  //set event global
  window.addEventListener('resize', onWindowResize );
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  //render Scene
  renderScene();
}

function addBox(width, height, depth, pos, color, name, opacity, draggable) {
  let obj = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth, 1, 1, 1),
    new THREE.MeshLambertMaterial({color: color, transparent: true, opacity: opacity })
  );
  obj.name = name;
  obj.position.set(pos.x, pos.y, pos.z);
  obj.isDraggable = draggable;
  scene.add(obj);
}

function dragObject() {
  if(draggableObject) {
    raycaster.setFromCamera(moveMouse, camera);
    const found = raycaster.intersectObjects(scene.children);
    if(found.length) {
      for (let obj of found) {
        if(!obj.object.isDraggable) {
          draggableObject.position.x = obj.point.x;
          draggableObject.position.z = obj.point.z;
          break;
        }
      }
    }
  }
}

function onPointerUp() {
  if(draggableObject) {
    draggableObject = undefined;
    controls.enabled = true;
    return;
  }

}

function onPointerDown(event){
  clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(clickMouse, camera);
  const found = raycaster.intersectObjects(scene.children, true);
  if (found.length && found[0].object.isDraggable) {
    draggableObject = found[0].object;
    controls.enabled = false;
    controls.update();
  }
}

function onPointerMove(event) {
  dragObject();
  moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function renderScene() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(renderScene);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}