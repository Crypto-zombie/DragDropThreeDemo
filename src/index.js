import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

let container;
let camera, scene, renderer;
let controls, draggableObject;
let itemEntity;

const clickMouse = new THREE.Vector2();
const moveMouse  = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const parentBoundary = new THREE.Box3();
const item = new THREE.Box3();

initScene();
addBox(20,10,15, {x: 0, y: 10, z: 0}, 'white', 'origin', 1, false);
cloneBox(20.4,10,15.4, {x: 0, y: 10, z: 0});
addBox(1,3,0.2, {x: 10, y: 10, z: 10}, 'red', 'item', 1, true);
// itemEntity.geometry.computeBoundingBox();
// item.copy(itemEntity.geometry.boundingBox);
addBox(20,10,0.1, {x: 0, y: 10, z: 7.5}, 'white', 'front', 0.5, false);
addBox(20,10,0.1, {x: 0, y: 10, z: -7.5}, 'white', 'back', 0.5, false);
addBox(0.1,10,15, {x: 10, y: 10, z: 0}, 'white', 'left', 0.5, false);
addBox(0.1,10,15, {x: -10, y: 10, z: 0}, 'white', 'right', 0.5, false);
addBox(20,0.1,15, {x: 0, y: 15, z: 0}, 'white', 'top', 0.5, false);

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
  floor.name = 'floor';
  floor.isDraggable = false;
  scene.add(floor);

  //set event global
  window.addEventListener('resize', onWindowResize );
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  const helper = new THREE.Box3Helper( parentBoundary, 0xffff00 );
  scene.add( helper );
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
  return obj;
}

function cloneBox(width, height, depth, pos) {
  let obj = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth, 1, 1, 1),
    new THREE.MeshBasicMaterial({color: 'white'})
  );
  obj.position.set(pos.x, pos.y, pos.z);
  obj.geometry.computeBoundingBox();
  parentBoundary.setFromObject(obj)
}

function dragObject() {
  if(draggableObject) {
    raycaster.setFromCamera(moveMouse, camera);
    const found = raycaster.intersectObjects(scene.children);
    if(found.length) {
      for (let obj of found) {
        if(!obj.object.isDraggable && obj.object.name === 'top') {
          break;
        }
        if(!obj.object.isDraggable && obj.object.name === 'floor') {
          draggableObject.position.x = obj.point.x;
          draggableObject.position.z = obj.point.z;
          draggableObject.position.y = 10;
          break;
        }
        else if(!obj.object.isDraggable && obj.object.name === 'origin') {
          const tempPos = draggableObject.position.clone();
          draggableObject.position.x = obj.point.x;
          draggableObject.position.z = obj.point.z;
          draggableObject.position.y = obj.point.y;
          draggableObject.geometry.computeBoundingBox();
          item.setFromObject(draggableObject)
          if(!parentBoundary.containsBox(item)) {
            draggableObject.position.x = tempPos.x;
            draggableObject.position.y = tempPos.y;
            draggableObject.position.z = tempPos.z;
          }
          break;
        }
        if(obj.object.name === 'front') {
          draggableObject.rotation.set(0,0,0);
        }
        else if(obj.object.name === 'left') {
          draggableObject.rotation.set(0,Math.PI/2,0);
        }
        else if(obj.object.name === 'right') {
          draggableObject.rotation.set(0,-Math.PI/2,0);
        }
        else if(obj.object.name === 'back') {
          draggableObject.rotation.set(0,0,0);
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