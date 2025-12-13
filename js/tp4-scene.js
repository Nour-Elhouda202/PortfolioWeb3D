import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let chaise1, table, box, box1, box2, box3;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let initialized = false;

function init() {
  const container = document.getElementById('scene-container');
  if (!container || initialized) return;
  initialized = true;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 2, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(3, 5, 2);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  renderer.domElement.addEventListener('click', onClick);
  window.addEventListener('resize', onResize);

  loadModel();
  animate();
}

function loadModel() {
  const loader = new GLTFLoader();

  loader.load('models/tp3.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // objets principaux
    chaise1 = model.getObjectByName('chaise');
    table   = model.getObjectByName('table');
    box     = model.getObjectByName('box');
    box1    = model.getObjectByName('box1');
    box2    = model.getObjectByName('box2');
    box3    = model.getObjectByName('box3');

    console.log('box1, box2, box3 =', box1, box2, box3);

    // chaise aller / retour
    if (chaise1 && table) {
      const startPos = chaise1.position.clone();
      const targetX  = table.position.x + 1.9;
      const targetZ  = table.position.z + 0.9;

      const targetPos = new THREE.Vector3(targetX, startPos.y, targetZ);

      chaise1.userData.startPos  = startPos;
      chaise1.userData.targetPos = targetPos;
      chaise1.userData.open      = false;
      chaise1.userData.t         = 1;
      chaise1.userData.moving    = false;
    }

    // couleurs table + box
    if (table) {
      table.userData.originalColor = getFirstMeshColor(table);
      table.userData.altColor      = new THREE.Color(0x3366ff);
      table.userData.toggled       = false;
    }
    if (box) {
      box.userData.originalColor = getFirstMeshColor(box);
      box.userData.altColor      = new THREE.Color(0x3366ff);
      box.userData.toggled       = false;
    }

    // cubes (poignées) devant les tiroirs
    const cube006 = model.getObjectByName('x1');
    const cube007 = model.getObjectByName('x2');
    const cube008 = model.getObjectByName('x3');

    console.log('cubes =', cube006, cube007, cube008);

    const pairs = [
      { drawer: box1, cube: cube006 },
      { drawer: box2, cube: cube007 },
      { drawer: box3, cube: cube008 }
    ];

    // config animation tiroir + cube (même déplacement +0.6 X)
    pairs.forEach(({ drawer, cube }) => {
      if (!drawer || !cube) return;

      drawer.userData.open     = false;
      drawer.userData.t        = 1;
      drawer.userData.startPos = drawer.position.clone();
      drawer.userData.openPos  = drawer.position.clone().add(
        new THREE.Vector3(0.6, 0, 0)
      );

      cube.userData = cube.userData || {};
      cube.userData.startPos = cube.position.clone();
      cube.userData.openPos  = cube.position.clone().add(
        new THREE.Vector3(0.6, 0, 0)
      );

      drawer.userData.cube = cube;
    });
  });
}

function getFirstMeshColor(obj) {
  let color = new THREE.Color(0xffffff);
  obj.traverse((child) => {
    if (child.isMesh && child.material && child.material.color) {
      color = child.material.color.clone();
    }
  });
  return color;
}

function setObjectColor(obj, color) {
  obj.traverse((child) => {
    if (child.isMesh && child.material && child.material.color) {
      child.material.color.copy(color);
    }
  });
}

// remonte la hiérarchie jusqu'à trouver box1/box2/box3
function findDrawerRoot(obj) {
  while (obj) {
    if (obj === box1 || obj === box2 || obj === box3) return obj;
    obj = obj.parent;
  }
  return null;
}

function onClick(event) {
  if (!renderer || !camera || !scene) return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const clickable = [];
  if (chaise1) clickable.push(chaise1);
  if (table)   clickable.push(table);
  if (box1)    clickable.push(box1);
  if (box2)    clickable.push(box2);
  if (box3)    clickable.push(box3);

  const intersects = raycaster.intersectObjects(clickable, true);
  if (intersects.length === 0) return;

  const hit = intersects[0].object;
  console.log('hit =', hit.name);

  // chaise
  if (chaise1 && (hit === chaise1 || chaise1.children.includes(hit))) {
    chaise1.userData.open   = !chaise1.userData.open;
    chaise1.userData.t      = 0;
    chaise1.userData.moving = true;
    return;
  }

  // table
  if (table && (hit === table || table.children.includes(hit))) {
    table.userData.toggled = !table.userData.toggled;
    const colorT = table.userData.toggled
      ? table.userData.altColor
      : table.userData.originalColor;
    setObjectColor(table, colorT);

    if (box) {
      box.userData.toggled = table.userData.toggled;
      const colorB = box.userData.toggled
        ? box.userData.altColor
        : box.userData.originalColor;
      setObjectColor(box, colorB);
    }
    return;
  }

  // tiroir : trouver le parent box1/2/3 et toggler son état
  const drawer = findDrawerRoot(hit);
  if (drawer && drawer.userData) {
    drawer.userData.open = !drawer.userData.open;
    drawer.userData.t    = 0;
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();

  // chaise
  if (chaise1 && chaise1.userData.moving) {
    const data = chaise1.userData;
    data.t += 0.02;
    if (data.t >= 1) {
      data.t = 1;
      data.moving = false;
    }

    const start = data.open ? data.startPos  : data.targetPos;
    const end   = data.open ? data.targetPos : data.startPos;
    chaise1.position.lerpVectors(start, end, data.t);
  }

  // tiroirs + cubes
  [box1, box2, box3].forEach((b) => {
    if (!b || !b.userData || !b.userData.cube) return;
    const cube = b.userData.cube;
    const data = b.userData;

    if (data.t < 1) {
      data.t += 0.05;

      const dStart = data.open ? data.startPos : data.openPos;
      const dEnd   = data.open ? data.openPos  : data.startPos;
      b.position.lerpVectors(dStart, dEnd, data.t);

      const cStart = data.open ? cube.userData.startPos : cube.userData.openPos;
      const cEnd   = data.open ? cube.userData.openPos  : cube.userData.startPos;
      cube.position.lerpVectors(cStart, cEnd, data.t);
    }
  });

  if (renderer && camera && scene) {
    renderer.render(scene, camera);
  }
}

function onResize() {
  const container = document.getElementById('scene-container');
  if (!container || !camera || !renderer) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener('DOMContentLoaded', () => {
  init();
});
