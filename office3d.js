import * as THREE from "./node_modules/three/build/three.module.js";

const DEPARTMENTS = [
  "Executive", "Product", "Research", "Data & Analytics", "Software Development", "Design",
  "Content", "Customer Support", "Operations", "Advertising", "Growth & Marketing", "Content studio"
];
const DEPARTMENT_COLORS = ["#a394c5", "#839ab8", "#80a999", "#b5a36f", "#8194b8", "#b18491", "#a187a8", "#ad9277", "#849b84", "#ae8d70", "#aa8290", "#819ba5"];
const COLS = [-24, -8, 8, 24];
const ROWS = [-16, 0, 16];
const ROOM_WIDTH = 12;
const ROOM_DEPTH = 12;
const WORKER_GROUND = -0.06;
const CAFE_CENTER = { x: -22, z: 26 };
const MEETING_CENTER = { x: 21, z: 26 };
const SERVER_ROOM = { x: -20.8, z: 2.55, width: 4.2, depth: 6.1 };
const ZOOM_MIN = 0.62;
const ZOOM_MAX = 4.5;
const state = { renderer: null, scene: null, camera: null, observer: null, raycaster: null, pointer: null, workers: new Map(), container: null, labelLayer: null, roomLabels: [], labelPosition: new THREE.Vector3(), visible: false, options: {}, azimuth: 0.72, dragAzimuth: 0, polar: 0.78, distance: 82, selected: "", lastTime: 0, lastLabelUpdate: 0, onSelect: null, onHover: null, onZoom: null, hovered: "", ground: null, lastMapScale: null };

function material(color, roughness = 0.78, extra = {}) {
  return new THREE.MeshStandardMaterial(Object.assign({ color, roughness }, extra));
}

function box(scene, dimensions, position, color, extra = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(dimensions[0], dimensions[1], dimensions[2]), material(color, extra.roughness == null ? 0.78 : extra.roughness, extra.material || {}));
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = extra.castShadow !== false;
  mesh.receiveShadow = true;
  if (extra.rotationY) mesh.rotation.y = extra.rotationY;
  scene.add(mesh);
  return mesh;
}

function makeLabel(text, background = "#292b32", foreground = "#f2f0e9", width = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = background;
  context.beginPath();
  context.roundRect(8, 8, canvas.width - 16, canvas.height - 16, 23);
  context.fill();
  context.fillStyle = foreground;
  context.font = "600 40px system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(String(text), canvas.width / 2, canvas.height / 2 + 2, canvas.width - 48);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(2.15, 0.54, 1);
  return sprite;
}

function makeWorldLabel(kind, text, color) {
  const element = document.createElement("div");
  element.className = `office-world-label ${kind}`;
  element.setAttribute("aria-hidden", "true");
  element.style.setProperty("--department-color", color);
  const dot = document.createElement("span");
  dot.className = "office-label-dot";
  dot.style.backgroundColor = color;
  const copy = document.createElement("span");
  copy.className = "office-label-text";
  copy.textContent = text;
  element.append(dot, copy);
  return { element, copy };
}

function ensureWorldLabelLayer(container) {
  if (!state.labelLayer) {
    state.labelLayer = document.createElement("div");
    state.labelLayer.className = "office-label-layer";
  }
  if (state.labelLayer.parentElement !== container) container.appendChild(state.labelLayer);
  state.roomLabels.forEach((label) => {
    if (!label.element) {
      const created = makeWorldLabel("room", label.text, label.color);
      label.element = created.element;
      label.copy = created.copy;
    }
    if (label.element.parentElement !== state.labelLayer) state.labelLayer.appendChild(label.element);
  });
}

function updateWorldLabels() {
  if (!state.labelLayer || !state.container || !state.camera) return;
  const now = performance.now();
  if (now - state.lastLabelUpdate < 80) return;
  state.lastLabelUpdate = now;
  const width = state.container.clientWidth;
  const height = state.container.clientHeight;
  const candidates = [];
  state.roomLabels.forEach((label) => candidates.push({ element: label.element, position: label.position, priority: state.options.showNames ? 1 : 2 }));
  state.workers.forEach((worker) => {
    if (!worker.nameLabel) return;
    worker.nameLabel.style.display = "none";
    const selected = worker.person.id === state.selectedEmployee;
    if (!state.options.showNames && !selected) return;
    candidates.push({
      element: worker.nameLabel,
      position: { x: worker.group.position.x, y: worker.group.position.y + 2.48, z: worker.group.position.z },
      priority: selected ? 3 : 2
    });
  });
  const projected = candidates.map((candidate) => {
    state.labelPosition.copy(candidate.position).project(state.camera);
    return Object.assign(candidate, {
      x: (state.labelPosition.x * 0.5 + 0.5) * width,
      y: (-state.labelPosition.y * 0.5 + 0.5) * height,
      depth: state.labelPosition.z
    });
  }).sort((first, second) => second.priority - first.priority);
  const placed = [];
  projected.forEach((candidate) => {
    const { element, x, y, depth } = candidate;
    const onScreen = depth >= -1 && depth <= 1 && x > -100 && x < width + 100 && y > -50 && y < height + 50;
    if (!onScreen) {
      element.style.display = "none";
      return;
    }
    element.style.display = "flex";
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    const labelWidth = element.offsetWidth;
    const labelHeight = element.offsetHeight;
    const bounds = { left: x - labelWidth / 2 - 5, right: x + labelWidth / 2 + 5, top: y - labelHeight - 5, bottom: y + 5 };
    const overlaps = placed.some((other) => bounds.left < other.right && bounds.right > other.left && bounds.top < other.bottom && bounds.bottom > other.top);
    if (overlaps) {
      element.style.display = "none";
      return;
    }
    placed.push(bounds);
  });
}

function buildChair(scene, x, z, rotation = 0, scale = 1) {
  const chair = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7 * scale, 0.15 * scale, 0.7 * scale), material("#4a4d55"));
  seat.position.y = 0.52 * scale;
  seat.castShadow = true;
  chair.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.68 * scale, 0.72 * scale, 0.14 * scale), material("#5d6068"));
  back.position.set(0, 0.9 * scale, -0.28 * scale);
  back.castShadow = true;
  chair.add(back);
  [-0.23, 0.23].forEach((dx) => [-0.23, 0.23].forEach((dz) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035 * scale, 0.045 * scale, 0.5 * scale, 6), material("#777a81"));
    leg.position.set(dx * scale, 0.25 * scale, dz * scale);
    chair.add(leg);
  }));
  chair.position.set(x, 0, z);
  chair.rotation.y = rotation;
  scene.add(chair);
  return chair;
}

function buildWallSegment(scene, axis, x, z, length) {
  const lower = axis === "z" ? [0.18, 1.35, length] : [length, 1.35, 0.18];
  const upper = axis === "z" ? [0.12, 0.8, length] : [length, 0.8, 0.12];
  box(scene, lower, [x, 0.69, z], "#b8b4aa");
  box(scene, upper, [x, 1.79, z], "#b6c8ca", { castShadow: false, material: { transparent: true, opacity: 0.32, roughness: 0.2, metalness: 0.04 } });
}

function buildDoorWall(scene, axis, x, z, length) {
  const gap = 1.9;
  const segmentLength = (length - gap) / 2;
  const halfOffset = (gap + segmentLength) / 2;
  if (axis === "z") {
    buildWallSegment(scene, axis, x, z - halfOffset, segmentLength);
    buildWallSegment(scene, axis, x, z + halfOffset, segmentLength);
    [-1, 1].forEach((side) => box(scene, [0.2, 2.18, 0.2], [x, 1.09, z + side * gap / 2], "#6b6258"));
    box(scene, [0.2, 0.18, gap + 0.2], [x, 2.17, z], "#6b6258");
  } else {
    buildWallSegment(scene, axis, x - halfOffset, z, segmentLength);
    buildWallSegment(scene, axis, x + halfOffset, z, segmentLength);
    [-1, 1].forEach((side) => box(scene, [0.2, 2.18, 0.2], [x + side * gap / 2, 1.09, z], "#6b6258"));
    box(scene, [gap + 0.2, 0.18, 0.2], [x, 2.17, z], "#6b6258");
  }
}

function addRoomDoorWalls(scene, x, z, col) {
  const halfW = ROOM_WIDTH / 2;
  const halfD = ROOM_DEPTH / 2;
  const entranceSide = col === 0 || col === 1 ? 1 : -1;
  if (entranceSide < 0) buildDoorWall(scene, "z", x - halfW, z, ROOM_DEPTH);
  else buildWallSegment(scene, "z", x - halfW, z, ROOM_DEPTH);
  if (entranceSide > 0) buildDoorWall(scene, "z", x + halfW, z, ROOM_DEPTH);
  else buildWallSegment(scene, "z", x + halfW, z, ROOM_DEPTH);
  buildWallSegment(scene, "x", x, z - halfD, ROOM_WIDTH);
  buildWallSegment(scene, "x", x, z + halfD, ROOM_WIDTH);
}

function buildPlanter(scene, x, z, scale = 1) {
  const plant = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * scale, 0.34 * scale, 0.52 * scale, 10), material("#a8754f"));
  pot.position.y = 0.28 * scale;
  plant.add(pot);
  for (let leaf = 0; leaf < 7; leaf += 1) {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.15 * scale, 1.18 * scale, 6), material(leaf % 2 ? "#4e7457" : "#78966b"));
    const angle = leaf * Math.PI * 0.29;
    blade.position.set(Math.cos(angle) * 0.19 * scale, 0.93 * scale, Math.sin(angle) * 0.19 * scale);
    blade.rotation.z = Math.cos(angle) * 0.22;
    blade.rotation.x = Math.sin(angle) * 0.22;
    plant.add(blade);
  }
  plant.position.set(x, 0, z);
  scene.add(plant);
  return plant;
}

function buildBench(scene, x, z, rotation = 0) {
  const bench = new THREE.Group();
  box(bench, [1.8, 0.16, 0.62], [0, 0.58, 0], "#7f6d59");
  box(bench, [1.8, 0.68, 0.13], [0, 0.96, -0.24], "#8c755d");
  [-0.68, 0.68].forEach((side) => box(bench, [0.1, 0.52, 0.1], [side, 0.27, 0], "#4f5052"));
  bench.position.set(x, 0, z);
  bench.rotation.y = rotation;
  scene.add(bench);
  return bench;
}

function buildWallArt(scene, x, z, color, rotation = 0) {
  const art = new THREE.Group();
  box(art, [1.45, 1.05, 0.1], [0, 0, 0], "#695d50");
  const canvas = box(art, [1.2, 0.8, 0.04], [0, 0, 0.07], color, { castShadow: false });
  canvas.material.emissive = new THREE.Color(color).multiplyScalar(0.12);
  art.position.set(x, 1.75, z);
  art.rotation.y = rotation;
  scene.add(art);
  return art;
}

function buildSofa(scene, x, z, rotation = 0) {
  const sofa = new THREE.Group();
  box(sofa, [3.1, 0.48, 0.95], [0, 0.55, 0], "#555a68");
  box(sofa, [3.1, 0.8, 0.22], [0, 1.05, -0.37], "#656b7b");
  [-1.42, 1.42].forEach((side) => box(sofa, [0.25, 0.85, 0.92], [side, 0.84, -0.02], "#777d8d"));
  sofa.position.set(x, 0, z);
  sofa.rotation.y = rotation;
  scene.add(sofa);
  return sofa;
}

function buildWoodFloor(scene, x, z, color) {
  const floor = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.08, 11.8), material(color, 0.9));
  floor.position.set(x, 0.12, z);
  floor.receiveShadow = true;
  scene.add(floor);
  for (let plank = 0; plank < 9; plank += 1) {
    const seam = box(scene, [0.024, 0.008, 11.6], [x - 5.24 + plank * 1.31, 0.165, z], plank % 2 ? "#b29167" : "#c7a77a", { castShadow: false });
    seam.material.roughness = 1;
  }
  for (let row = 0; row < 6; row += 1) {
    const offset = row % 2 ? 0.6 : -0.6;
    for (let plank = 0; plank < 4; plank += 1) {
      box(scene, [1.25, 0.008, 0.022], [x - 4.6 + plank * 2.7 + offset, 0.166, z - 4.9 + row * 1.95], "#b9966b", { castShadow: false });
    }
  }
}

function buildRoomBoard(scene, x, z, color, title, rotation = 0) {
  const board = new THREE.Group();
  box(board, [2.35, 1.32, 0.12], [0, 0, 0], "#7e6f5e");
  box(board, [2.12, 1.12, 0.045], [0, 0, 0.09], "#f0ede2", { castShadow: false });
  const banner = box(board, [1.95, 0.17, 0.035], [0, 0.41, 0.125], color, { castShadow: false });
  banner.material.emissive = new THREE.Color(color).multiplyScalar(0.16);
  for (let i = 0; i < 4; i += 1) {
    const note = box(board, [0.34, 0.31, 0.032], [-0.65 + i * 0.43, -0.1 + (i % 2) * 0.12, 0.13], ["#e5c57b", "#82b8aa", "#d98982", "#9f92d1"][i], { castShadow: false });
    note.material.roughness = 0.93;
  }
  const label = makeLabel(title, "#4b4541", "#f6f0e4", 320);
  label.scale.set(1.65, 0.42, 1);
  label.position.set(0, -0.48, 0.16);
  board.add(label);
  board.position.set(x, 1.92, z);
  board.rotation.y = rotation;
  scene.add(board);
  return board;
}

function buildBookcase(scene, x, z, rotation = 0) {
  const shelf = new THREE.Group();
  box(shelf, [2.1, 2.3, 0.38], [0, 1.15, 0], "#735a42");
  for (let level = 0; level < 4; level += 1) {
    box(shelf, [1.98, 0.1, 0.44], [0, 0.34 + level * 0.58, 0.015], "#9d7852");
    for (let book = 0; book < 6; book += 1) {
      const height = 0.29 + ((book + level) % 3) * 0.055;
      const spine = box(shelf, [0.22, height, 0.28], [-0.78 + book * 0.31, 0.4 + level * 0.58 + height / 2, 0.01], ["#8c788c", "#638a7e", "#bf9461", "#7788a8"][book % 4], { castShadow: true });
      spine.rotation.z = (book % 2 ? 1 : -1) * 0.05;
    }
  }
  shelf.position.set(x, 0, z);
  shelf.rotation.y = rotation;
  scene.add(shelf);
}

function buildServerRack(scene, x, z, rotation = 0) {
  const rack = new THREE.Group();
  box(rack, [0.92, 2.25, 0.78], [0, 1.13, 0], "#252a30", { roughness: 0.42, material: { metalness: 0.28 } });
  box(rack, [0.78, 2.02, 0.045], [0, 1.14, 0.414], "#171b20", { castShadow: false });
  for (let shelf = 0; shelf < 7; shelf += 1) {
    const y = 0.34 + shelf * 0.26;
    box(rack, [0.66, 0.13, 0.06], [0, y, 0.45], shelf % 2 ? "#333941" : "#292f37", { castShadow: false });
    [-0.23, -0.12, -0.01, 0.1, 0.21].forEach((dx, index) => {
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.027, 8, 8), material(index % 3 ? "#65d3b0" : "#83a9ff", 0.3, { emissive: new THREE.Color(index % 3 ? "#31b98d" : "#527dff"), emissiveIntensity: 0.7 }));
      led.position.set(dx, y, 0.493);
      rack.add(led);
    });
  }
  rack.position.set(x, 0, z);
  rack.rotation.y = rotation;
  scene.add(rack);
  return rack;
}

function buildRingLight(scene, x, z, color = "#f4e8d4") {
  const stand = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.5, 8), material("#4f5158"));
  pole.position.y = 0.78;
  stand.add(pole);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.085, 8, 24), material(color, 0.32, { emissive: new THREE.Color(color), emissiveIntensity: 0.38 }));
  ring.position.y = 1.65;
  stand.add(ring);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.4, 0.1, 12), material("#4f5158"));
  foot.position.y = 0.06;
  stand.add(foot);
  stand.position.set(x, 0, z);
  scene.add(stand);
  return stand;
}

function buildCameraStand(scene, x, z, rotation = 0) {
  const stand = new THREE.Group();
  const legs = new THREE.Group();
  [-0.27, 0, 0.27].forEach((dx, index) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.035, 1.05, 6), material("#484a4e"));
    leg.position.set(dx, 0.5, index === 1 ? 0.18 : -0.12);
    leg.rotation.z = dx * -1.1;
    legs.add(leg);
  });
  stand.add(legs);
  box(stand, [0.48, 0.32, 0.3], [0, 1.11, 0], "#292d33", { roughness: 0.42 });
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.18, 16), material("#4c5f77", 0.28, { metalness: 0.35 }));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 1.11, 0.22);
  stand.add(lens);
  stand.position.set(x, 0, z);
  stand.rotation.y = rotation;
  scene.add(stand);
  return stand;
}

function buildFloorLamp(scene, x, z) {
  const lamp = new THREE.Group();
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.31, 0.12, 12), material("#4f4d4a"));
  foot.position.y = 0.08;
  lamp.add(foot);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 1.8, 8), material("#706958", 0.52, { metalness: 0.16 }));
  pole.position.y = 0.98;
  lamp.add(pole);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.44, 12, 1, true), material("#ead7aa", 0.54, { side: THREE.DoubleSide, emissive: new THREE.Color("#d9b974"), emissiveIntensity: 0.2 }));
  shade.position.y = 1.95;
  lamp.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), material("#fff0c8", 0.2, { emissive: new THREE.Color("#ffc766"), emissiveIntensity: 0.7 }));
  bulb.position.y = 1.73;
  lamp.add(bulb);
  lamp.position.set(x, 0, z);
  scene.add(lamp);
  return lamp;
}

function buildDepartmentDecor(scene, department, index, x, z) {
  const color = DEPARTMENT_COLORS[index];
  const rug = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.045, 7.4), material(index === 10 ? "#d48fba" : color, 0.96, { transparent: true, opacity: index === 10 ? 0.48 : 0.2 }));
  rug.position.set(x, 0.19, z + 0.1);
  scene.add(rug);
  buildRoomBoard(scene, x - 3.0, z - 5.86, color, department === "Growth & Marketing" ? "SOCIAL STUDIO" : department);

  if (department === "Executive") {
    buildSofa(scene, x - 2.6, z + 2.0, Math.PI / 2);
    buildBench(scene, x + 1.8, z + 2.0);
    buildPlanter(scene, x + 4.5, z - 3.8, 0.8);
  } else if (department === "Product") {
    buildBookcase(scene, x + 3.6, z - 3.8, Math.PI / 2);
    buildBench(scene, x + 1.1, z + 2.6, Math.PI / 2);
  } else if (department === "Research") {
    buildBookcase(scene, x + 3.8, z - 3.2, Math.PI / 2);
    buildBookcase(scene, x + 3.8, z + 0.1, Math.PI / 2);
  } else if (department === "Data & Analytics") {
    buildRoomBoard(scene, x + 3.2, z - 5.86, "#517d91", "LIVE DASHBOARD");
    [-1.6, 0, 1.6].forEach((offset) => {
      const screen = box(scene, [1.3, 0.9, 0.09], [x + offset, 1.35, z + 3.4], "#252a34", { castShadow: false });
      const screenFace = box(scene, [1.12, 0.72, 0.025], [x + offset, 1.35, z + 3.345], ["#547c86", "#897bb0", "#bc9664"][Math.round(offset + 1.6) % 3], { castShadow: false });
      screenFace.material.emissive = new THREE.Color("#324d59");
    });
  } else if (department === "Software Development") {
    buildRoomBoard(scene, x - 3.2, z + 5.86, "#5a75aa", "BUILD · SHIP · REPEAT", Math.PI);
    box(scene, [3.3, 0.18, 1.3], [x - 2.5, 0.87, z - 3.9], "#77705f");
  } else if (department === "Design") {
    for (let swatch = 0; swatch < 5; swatch += 1) {
      const tile = box(scene, [0.72, 0.78, 0.08], [x - 2.9 + swatch * 1.15, 1.28, z - 2.25], ["#da8c9c", "#e9bf69", "#7caf9c", "#788fc3", "#ad86b8"][swatch], { castShadow: false });
      tile.rotation.z = (swatch % 2 ? -1 : 1) * 0.04;
    }
    buildPlanter(scene, x + 4.25, z + 3.8, 0.9);
  } else if (department === "Content") {
    buildRingLight(scene, x + 3.7, z + 2.8);
    buildBookcase(scene, x - 4.15, z - 3.2, Math.PI / 2);
    const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.55, 10), material("#393b43"));
    mic.position.set(x + 1.4, 1.2, z + 2.6);
    scene.add(mic);
  } else if (department === "Customer Support") {
    buildBench(scene, x + 2.2, z + 2.8, Math.PI / 2);
    buildPlanter(scene, x + 4.3, z - 3.7, 0.95);
    buildRoomBoard(scene, x + 3.0, z + 5.86, "#6a9b87", "HELP DESK", Math.PI);
  } else if (department === "Operations") {
    buildBookcase(scene, x + 3.9, z - 3.3, Math.PI / 2);
    buildBench(scene, x + 1.8, z + 2.9);
  } else if (department === "Advertising") {
    buildRoomBoard(scene, x + 3.2, z - 5.86, "#d36e67", "CAMPAIGN WALL");
    buildRingLight(scene, x - 3.7, z + 2.7, "#f5d87d");
  } else if (department === "Growth & Marketing") {
    // Social media room: bright set, lights, camera and colorful props.
    buildRingLight(scene, x - 3.8, z + 2.45, "#f1a9d1");
    buildRingLight(scene, x + 3.7, z + 2.55, "#c9aaff");
    buildCameraStand(scene, x, z + 3.8, Math.PI);
    buildRoomBoard(scene, x + 3.0, z + 5.86, "#db79b1", "CREATE · SHARE · GROW", Math.PI);
    ["#f47e9b", "#f5bb59", "#86c9b4", "#a593e5"].forEach((accent, prop) => {
      const token = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.34, 0.55, 10), material(accent, 0.55));
      token.position.set(x - 3.2 + prop * 2.05, 0.48, z + 0.5 + (prop % 2) * 0.55);
      scene.add(token);
    });
    buildSofa(scene, x - 1.7, z - 1.7, Math.PI / 2);
    buildPlanter(scene, x + 4.45, z + 4.1, 0.9);
  } else if (department === "Content studio") {
    buildCameraStand(scene, x - 2.8, z + 2.6, Math.PI);
    buildRingLight(scene, x + 3.4, z + 2.6);
    const backdrop = box(scene, [3.8, 2.35, 0.16], [x, 1.22, z - 4.55], "#7a6f87", { castShadow: false });
    backdrop.material.emissive = new THREE.Color("#342d42");
    buildBookcase(scene, x + 4.0, z - 2.0, Math.PI / 2);
  }
}

function buildServerRoom(scene) {
  const left = SERVER_ROOM.x - SERVER_ROOM.width / 2;
  const right = SERVER_ROOM.x + SERVER_ROOM.width / 2;
  const north = SERVER_ROOM.z - SERVER_ROOM.depth / 2;
  const south = SERVER_ROOM.z + SERVER_ROOM.depth / 2;
  const floor = new THREE.Mesh(new THREE.BoxGeometry(SERVER_ROOM.width - 0.18, 0.07, SERVER_ROOM.depth - 0.18), material("#555a61", 0.82));
  floor.position.set(SERVER_ROOM.x, 0.2, SERVER_ROOM.z);
  floor.receiveShadow = true;
  scene.add(floor);
  buildDoorWall(scene, "z", left, SERVER_ROOM.z, SERVER_ROOM.depth);
  buildWallSegment(scene, "z", right, SERVER_ROOM.z, SERVER_ROOM.depth);
  buildWallSegment(scene, "x", SERVER_ROOM.x, north, SERVER_ROOM.width);
  buildWallSegment(scene, "x", SERVER_ROOM.x, south, SERVER_ROOM.width);
  buildServerRack(scene, right - 0.65, north + 1.3);
  buildServerRack(scene, right - 0.65, SERVER_ROOM.z);
  buildServerRack(scene, right - 0.65, south - 1.3);
  const console = box(scene, [1.55, 0.88, 0.58], [SERVER_ROOM.x - 1.45, 0.72, north + 0.72], "#5b554d");
  box(scene, [1.6, 0.09, 0.64], [SERVER_ROOM.x - 1.45, 1.19, north + 0.72], "#b4a58c");
  box(scene, [0.74, 0.48, 0.07], [SERVER_ROOM.x - 1.45, 1.58, north + 0.53], "#2d3340", { castShadow: false });
  const screen = box(scene, [0.62, 0.36, 0.025], [SERVER_ROOM.x - 1.45, 1.58, north + 0.49], "#5b95a3", { castShadow: false });
  screen.material.emissive = new THREE.Color("#2f6875");
  state.roomLabels.push({ text: "Server room", color: "#51b7a8", position: new THREE.Vector3(SERVER_ROOM.x, 4.9, SERVER_ROOM.z - SERVER_ROOM.depth / 2 + 0.65), element: null, copy: null });
}

function buildMainEntrance(scene) {
  // One recognizable glass entry anchors the front of the office.
  box(scene, [5.75, 0.18, 1.35], [0, 2.72, 37.55], "#4b4743");
  box(scene, [4.9, 0.11, 0.86], [0, 2.82, 37.1], "#d0b779", { castShadow: false });
  [-1, 1].forEach((side) => {
    box(scene, [0.14, 2.55, 0.16], [side * 2.62, 1.25, 37], "#5d5550");
    box(scene, [2.35, 2.34, 0.08], [side * 1.25, 1.24, 37], "#9cb7b9", { castShadow: false, material: { transparent: true, opacity: 0.46, roughness: 0.22, metalness: 0.08 } });
    box(scene, [0.055, 0.78, 0.08], [side * 1.88, 1.2, 36.9], "#d2b366");
  });
  box(scene, [0.14, 2.55, 0.16], [0, 1.25, 37], "#5d5550");
  const sign = makeLabel("Codly Office · Welcome", "#282c32", "#f2d99b");
  sign.position.set(0, 3.18, 37.7);
  sign.scale.set(4.15, 0.88, 1);
  scene.add(sign);
  for (const x of [-2.5, 2.5]) {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), material("#ffdf9c", 0.3, { emissive: new THREE.Color("#ffc565"), emissiveIntensity: 1.1 }));
    lamp.position.set(x, 2.88, 36.85);
    scene.add(lamp);
  }
}

function buildOffice() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#17181b");
  scene.fog = new THREE.Fog("#17181b", 105, 185);

  const hemisphere = new THREE.HemisphereLight("#fff4dd", "#4b5263", 2.15);
  scene.add(hemisphere);
  const keyLight = new THREE.DirectionalLight("#fff3d8", 3.25);
  keyLight.position.set(-34, 58, 38);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.left = -48;
  keyLight.shadow.camera.right = 48;
  keyLight.shadow.camera.top = 48;
  keyLight.shadow.camera.bottom = -48;
  keyLight.shadow.bias = -0.0004;
  scene.add(keyLight);
  const fillLight = new THREE.PointLight("#9a8cf8", 48, 120, 2);
  fillLight.position.set(0, 8, 4);
  scene.add(fillLight);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), material("#1b1c20", 0.98));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.68;
  ground.receiveShadow = true;
  scene.add(ground);

  box(scene, [68, 0.7, 66], [0, -0.35, 4], "#514d48");
  box(scene, [67.5, 0.12, 65.5], [0, 0.03, 4], "#d5d1c4", { castShadow: false });

  // Wide tiled corridors link the enclosed department rooms.
  [-16, 0, 16].forEach((x) => {
    box(scene, [3.8, 0.035, 50], [x, 0.105, 0], "#bdb8ad", { castShadow: false });
    for (let z = -22; z <= 22; z += 4) box(scene, [3.8, 0.012, 0.045], [x, 0.13, z], "#d3cfc5", { castShadow: false });
  });
  [-8, 8].forEach((z) => {
    box(scene, [64, 0.035, 3.8], [0, 0.105, z], "#bdb8ad", { castShadow: false });
    for (let x = -30; x <= 30; x += 4) box(scene, [0.045, 0.012, 3.8], [x, 0.13, z], "#d3cfc5", { castShadow: false });
  });

  const roomCenters = new Map();
  state.roomLabels = [];
  DEPARTMENTS.forEach((department, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    const x = COLS[col];
    const z = ROWS[row];
    roomCenters.set(department, { x, z, index });
    buildWoodFloor(scene, x, z, ["#d1ad79", "#c7a777", "#d6b985", "#c9a978"][index % 4]);
    const entranceSide = col === 0 || col === 1 ? 1 : -1;
    state.roomLabels.push({ text: department, color: DEPARTMENT_COLORS[index], position: new THREE.Vector3(x, 5.4, z - 5.6), element: null, copy: null });
    addRoomDoorWalls(scene, x, z, col);
    buildDepartmentDecor(scene, department, index, x, z);
    buildPlanter(scene, department === "Software Development" ? x - 4.45 : x + 4.45, z + 4.3, 0.85);
  });
  buildServerRoom(scene);

  // Exterior walls leave a broad front entrance into a furnished lobby.
  box(scene, [0.32, 2.8, 66], [-34, 1.4, 4], "#a9a79f");
  box(scene, [0.32, 2.8, 66], [34, 1.4, 4], "#a9a79f");
  box(scene, [68, 2.8, 0.32], [0, 1.4, -29], "#a9a79f");
  box(scene, [30.5, 2.8, 0.32], [-18.05, 1.4, 37], "#a9a79f");
  box(scene, [30.5, 2.8, 0.32], [18.05, 1.4, 37], "#a9a79f");
  buildMainEntrance(scene);

  // Corridor accessories and a relaxed reception area make the floor feel occupied.
  buildBench(scene, -31.8, -4.5, Math.PI / 2);
  buildBench(scene, 31.8, 3.5, -Math.PI / 2);
  buildPlanter(scene, -31.8, 2, 1.05);
  buildPlanter(scene, 31.8, -6, 1.05);
  buildWallArt(scene, -30.05, -10, "#7e9a91", 0);
  buildWallArt(scene, 30.05, 10, "#927bb4", Math.PI);
  buildBench(scene, -10.4, -8, Math.PI / 2);
  buildBench(scene, 10.4, 8, -Math.PI / 2);
  buildPlanter(scene, -14.6, -8, 0.75);
  buildPlanter(scene, 14.6, 8, 0.75);
  [-16, 0, 16].forEach((x, index) => {
    const wayfinding = makeLabel(index === 1 ? "Main hall · A1—A4" : (index === 0 ? "North hall · B1—B4" : "East hall · C1—C4"), "#373b43", "#ece4d2");
    wayfinding.position.set(x, 2.65, -8);
    wayfinding.scale.set(4.2, 0.83, 1);
    scene.add(wayfinding);
  });
  const lobbyRug = new THREE.Mesh(new THREE.BoxGeometry(31, 0.035, 10), material("#6e6972", 0.96));
  lobbyRug.position.set(0, 0.12, 27.2);
  scene.add(lobbyRug);
  buildSofa(scene, -2.8, 27.5, Math.PI / 2);
  buildSofa(scene, 2.8, 27.5, -Math.PI / 2);
  const loungeTable = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.14, 24), material("#b99a6d"));
  loungeTable.position.set(0, 0.56, 27.5);
  scene.add(loungeTable);
  const loungeTableBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.58, 10), material("#68645c"));
  loungeTableBase.position.set(0, 0.29, 27.5);
  scene.add(loungeTableBase);
  buildFloorLamp(scene, -6.4, 27.3);
  buildFloorLamp(scene, 6.4, 27.3);
  buildPlanter(scene, -7, 31, 1.15);
  buildPlanter(scene, 7, 31, 1.15);
  box(scene, [4.8, 0.92, 0.95], [0, 0.72, 33.25], "#705a47");
  box(scene, [4.95, 0.12, 1.05], [0, 1.23, 33.25], "#d2bd9b");
  box(scene, [0.78, 0.57, 0.08], [-1.0, 1.61, 33.12], "#313841", { castShadow: false });
  const receptionScreen = box(scene, [0.62, 0.41, 0.025], [-1.0, 1.61, 33.07], "#84a4ac", { castShadow: false });
  receptionScreen.material.emissive = new THREE.Color("#3c6672");
  const receptionSign = makeLabel("Reception · Welcome", "#49433d", "#f4e5c1");
  receptionSign.position.set(0, 2.35, 33.25);
  receptionSign.scale.set(3.2, 0.65, 1);
  scene.add(receptionSign);

  // A small cafe: counter, machine, cups and a shared high table.
  box(scene, [4.2, 0.3, 0.9], [-25, 0.82, 29.2], "#6b5347");
  box(scene, [4.35, 0.13, 1.03], [-25, 1.02, 29.2], "#ded5c2");
  box(scene, [0.85, 1.12, 0.68], [-26.1, 1.62, 29.0], "#3a3d45");
  box(scene, [0.34, 0.18, 0.15], [-26.1, 2.26, 29.0], "#9484ef");
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.22, 12), material("#f2eee2"));
  mug.position.set(-24.1, 1.23, 29.0);
  scene.add(mug);
  const cafeTable = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.14, 28), material("#ba9d75"));
  cafeTable.position.set(CAFE_CENTER.x, 0.93, CAFE_CENTER.z);
  cafeTable.castShadow = true;
  scene.add(cafeTable);
  const cafeStem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.88, 10), material("#77736a"));
  cafeStem.position.set(CAFE_CENTER.x, 0.49, CAFE_CENTER.z);
  scene.add(cafeStem);
  [-1, 1].forEach((side) => buildChair(scene, CAFE_CENTER.x + side * 1.5, CAFE_CENTER.z, side < 0 ? Math.PI / 2 : -Math.PI / 2, 0.84));
  const cafeSign = makeLabel("Cafe · coffee & water", "#51433b", "#fff0d5");
  cafeSign.position.set(-25.4, 2.5, 31.0);
  cafeSign.scale.set(3.5, 0.78, 1);
  scene.add(cafeSign);

  // Meeting room table and chairs.
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.15, 0.22, 32), material("#77624f"));
  tableTop.position.set(MEETING_CENTER.x, 0.93, MEETING_CENTER.z);
  tableTop.castShadow = true;
  scene.add(tableTop);
  const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.4, 0.92, 10), material("#67615a"));
  tableBase.position.set(MEETING_CENTER.x, 0.48, MEETING_CENTER.z);
  scene.add(tableBase);
  for (let i = 0; i < 7; i += 1) {
    const angle = (i / 7) * Math.PI * 2;
    const x = MEETING_CENTER.x + Math.cos(angle) * 3.15;
    const z = MEETING_CENTER.z + Math.sin(angle) * 3.15;
    buildChair(scene, x, z, -angle + Math.PI / 2, 0.9);
  }
  const meetingSign = makeLabel("Team meeting", "#3c3b43", "#e8e2ff");
  meetingSign.position.set(MEETING_CENTER.x, 2.75, 30.7);
  meetingSign.scale.set(3.1, 0.72, 1);
  scene.add(meetingSign);
  const screen = box(scene, [3.2, 1.8, 0.13], [MEETING_CENTER.x, 2.4, 31.15], "#393b43");
  const screenFace = box(scene, [2.9, 1.5, 0.04], [MEETING_CENTER.x, 2.4, 31.04], "#8174d8", { castShadow: false });
  screenFace.material.emissive = new THREE.Color("#3a326c");
  screenFace.material.emissiveIntensity = 0.5;
  screen.rotation.x = 0;

  const camera = new THREE.OrthographicCamera(-12, 12, 12, -12, 0.1, 150);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.domElement.className = "office-3d-canvas";
  renderer.domElement.setAttribute("aria-label", "Interactive 3D AI office. Drag to orbit, scroll to zoom.");
  renderer.domElement.setAttribute("role", "application");

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  Object.assign(state, { scene, camera, renderer, raycaster, pointer, roomCenters });
  buildCamera();
  return state;
}

function buildDesk(scene, position, departmentColor) {
  const group = new THREE.Group();
  const wood = material("#a89070");
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.14, 0.78), wood);
  top.position.y = 0.92;
  top.castShadow = true;
  group.add(top);
  [-0.62, 0.62].forEach((x) => [-0.26, 0.26].forEach((z) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.86, 0.08), material("#827762"));
    leg.position.set(x, 0.46, z);
    group.add(leg);
  }));
  const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.48, 0.07), material("#33343a", 0.5));
  monitor.position.set(0, 1.29, -0.22);
  monitor.castShadow = true;
  group.add(monitor);
  const screenColor = new THREE.Color(departmentColor).multiplyScalar(0.82);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.36, 0.025), material(screenColor, 0.4, { emissive: screenColor.clone().multiplyScalar(0.45) }));
  screen.position.set(0, 1.29, -0.173);
  group.add(screen);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.23, 8), material("#73757a"));
  stand.position.set(0, 1.04, -0.22);
  group.add(stand);
  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.16), material("#484a4e"));
  keyboard.position.set(0, 1.02, 0.14);
  group.add(keyboard);
  group.position.set(position.x, 0, position.z);
  scene.add(group);
  buildChair(scene, position.x, position.z + 0.85, Math.PI, 0.78);
  return group;
}

function buildWorker(person, position, departmentColor) {
  const group = new THREE.Group();
  const departmentHsl = new THREE.Color(departmentColor).getHSL({});
  const shirtColor = new THREE.Color().setHSL(departmentHsl.h, 0.38, 0.53);
  const skin = material("#d4ae91");
  const shirt = material(shirtColor);
  const dark = material("#39383c");
  const hair = material("#4d4039");

  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), new THREE.MeshBasicMaterial({ color: "#34312d", transparent: true, opacity: 0.24, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  group.add(shadow);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.13, 0.64, 0);
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.56, 9), dark);
  legL.position.y = -0.17;
  leftLeg.add(legL);
  const footL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.11, 0.29), dark);
  footL.position.set(0, -0.43, 0.08);
  leftLeg.add(footL);
  group.add(leftLeg);
  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.13;
  group.add(rightLeg);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.54, 5, 10), shirt);
  torso.position.y = 1.12;
  torso.castShadow = true;
  group.add(torso);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.1, 0.16, 10), skin);
  neck.position.y = 1.52;
  group.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.245, 18, 14), skin);
  head.position.y = 1.77;
  head.castShadow = true;
  group.add(head);
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.25, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), hair);
  hairCap.position.set(0, 1.83, -0.01);
  group.add(hairCap);
  [-0.085, 0.085].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), dark);
    eye.position.set(x, 1.78, 0.227);
    group.add(eye);
  });

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.27, 1.34, 0);
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.42, 4, 8), shirt);
  armL.position.y = -0.27;
  armL.rotation.z = -0.13;
  armL.castShadow = true;
  leftArm.add(armL);
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.075, 9, 8), skin);
  handL.position.set(-0.035, -0.53, 0.02);
  leftArm.add(handL);
  group.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.27;
  rightArm.rotation.z = -0.08;
  group.add(rightArm);

  const cup = new THREE.Group();
  const cupBody = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.16, 10), material("#eee9dd"));
  cup.add(cupBody);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.066, 10), material("#5b3927"));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.085;
  cup.add(coffee);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 6, 10, Math.PI * 1.65), material("#eee9dd"));
  handle.position.set(0.09, 0, 0);
  handle.rotation.z = Math.PI / 2;
  cup.add(handle);
  cup.position.set(0.34, 0.84, 0.16);
  cup.visible = false;
  group.add(cup);

  const selectionRing = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.49, 28), new THREE.MeshBasicMaterial({ color: "#9b8aff", side: THREE.DoubleSide, transparent: true, opacity: 0.9 }));
  selectionRing.rotation.x = -Math.PI / 2;
  selectionRing.position.y = 0.045;
  selectionRing.visible = false;
  group.add(selectionRing);

  group.position.set(position.x, WORKER_GROUND, position.z);
  group.rotation.y = Math.PI;
  group.userData.employeeId = person.id;
  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.userData.employeeId = person.id;
    }
  });
  state.scene.add(group);
  return { name: person.name, group, shirt, leftLeg, rightLeg, leftArm, rightArm, cup, selectionRing, nameLabel: null, nameLabelCopy: null, home: new THREE.Vector3(position.x, WORKER_GROUND, position.z), lookTarget: new THREE.Vector3(position.x, WORKER_GROUND, position.z - 1), status: person.status, phase: Math.random() * Math.PI * 2, person, path: [], pathIndex: 0, pathKey: "", wanderState: "waiting", nextWanderAt: Date.now() + 5000 + Math.random() * 15000, wanderUntil: 0, wanderTarget: new THREE.Vector3(position.x, WORKER_GROUND, position.z), wanderBounds: null };
}

function buildCamera() {
  if (!state.camera) return;
  const width = Math.max(state.container?.clientWidth || 640, 320);
  const height = Math.max(state.container?.clientHeight || 500, 300);
  const aspect = width / height;
  // Keep the whole floor visible while using more of the tall Office viewport.
  const size = Math.max(68, 96 / aspect);
  state.camera.left = -size * aspect / 2;
  state.camera.right = size * aspect / 2;
  state.camera.top = size / 2;
  state.camera.bottom = -size / 2;
  state.camera.near = 0.1;
  state.camera.far = 150;
  state.camera.zoom = Number(state.options.mapScale) || 1;
  state.lastMapScale = state.camera.zoom;
  state.camera.updateProjectionMatrix();
  updateCameraPosition();
  state.renderer?.setSize(width, height, false);
}

function updateCameraPosition() {
  if (!state.camera) return;
  const theta = state.azimuth + state.dragAzimuth;
  const sin = Math.sin(state.polar);
  const target = new THREE.Vector3(0, 0.2, 4);
  state.camera.position.set(
    target.x + state.distance * sin * Math.sin(theta),
    target.y + state.distance * Math.cos(state.polar),
    target.z + state.distance * sin * Math.cos(theta)
  );
  state.camera.lookAt(target);
  state.camera.updateProjectionMatrix();
}

function workerDestination(worker, person) {
  const activity = state.options.activity;
  if (activity && activity.type === "meeting" && activity.participantIds.includes(person.id)) {
    const index = Math.max(0, activity.participantIds.indexOf(person.id));
    const angle = (index / Math.max(1, activity.participantIds.length)) * Math.PI * 2;
    return new THREE.Vector3(MEETING_CENTER.x + Math.cos(angle) * 3.15, WORKER_GROUND, MEETING_CENTER.z + Math.sin(angle) * 3.15);
  }
  if (activity && activity.type === "coffee" && activity.participantIds.includes(person.id)) {
    const index = Math.max(0, activity.participantIds.indexOf(person.id));
    const angle = (index / Math.max(1, activity.participantIds.length)) * Math.PI * 2;
    return new THREE.Vector3(CAFE_CENTER.x + Math.cos(angle) * 1.8, WORKER_GROUND, CAFE_CENTER.z + Math.sin(angle) * 1.8);
  }
  return worker.home;
}

function workerRoute(worker, person, activity, destination) {
  const index = DEPARTMENTS.indexOf(DEPARTMENTS.includes(person.department) ? person.department : "Executive");
  const col = index % 4;
  const row = Math.floor(index / 4);
  const room = { x: COLS[col], z: ROWS[row] };
  const hallX = col === 0 ? -16 : col === 1 || col === 2 ? 0 : 16;
  const side = hallX < room.x ? -1 : 1;
  const wallX = room.x + side * ROOM_WIDTH / 2;
  const current = worker.group.position;
  const insideRoom = Math.abs(current.x - room.x) < ROOM_WIDTH / 2 - 0.15 && Math.abs(current.z - room.z) < ROOM_DEPTH / 2 - 0.15;
  const isDevOps = /devops/i.test(person.role || "");
  const insideServerRoom = isDevOps && Math.abs(current.x - SERVER_ROOM.x) < SERVER_ROOM.width / 2 - 0.15 && Math.abs(current.z - SERVER_ROOM.z) < SERVER_ROOM.depth / 2 - 0.15;
  const selectedActivity = activity && activity.participantIds.includes(person.id);
  const waypoints = [];
  const add = (x, z) => {
    const previous = waypoints[waypoints.length - 1];
    if (!previous || Math.abs(previous.x - x) + Math.abs(previous.z - z) > 0.05) waypoints.push(new THREE.Vector3(x, WORKER_GROUND, z));
  };
  if (insideServerRoom && selectedActivity) {
    const serverDoorX = SERVER_ROOM.x - SERVER_ROOM.width / 2;
    add(serverDoorX + 0.62, SERVER_ROOM.z);
    add(serverDoorX - 0.62, SERVER_ROOM.z);
    add(wallX - side * 0.62, room.z);
    add(wallX + side * 0.62, room.z);
    add(hallX, room.z);
    add(hallX, 23.2);
  } else if (insideRoom && selectedActivity) {
    add(wallX - side * 0.62, room.z);
    add(wallX + side * 0.62, room.z);
    add(hallX, room.z);
    add(hallX, 23.2);
  } else if (!insideRoom && current.z < 23.2) {
    const nearbyVerticalHall = [-16, 0, 16].reduce((best, value) => Math.abs(value - current.x) < Math.abs(best - current.x) ? value : best, -16);
    const nearbyHorizontalHall = [-8, 8].reduce((best, value) => Math.abs(value - current.z) < Math.abs(best - current.z) ? value : best, -8);
    if (Math.abs(nearbyVerticalHall - current.x) < 2.2) {
      add(nearbyVerticalHall, 23.2);
    } else if (Math.abs(nearbyHorizontalHall - current.z) < 2.2) {
      add(current.x, nearbyHorizontalHall);
      add(hallX, nearbyHorizontalHall);
      add(hallX, 23.2);
    } else {
      add(hallX, 23.2);
    }
  } else if (!insideRoom) {
    add(hallX, 23.2);
  }

  if (selectedActivity) {
    add(hallX, 23.2);
    add(destination.x, destination.z);
  } else if (insideRoom) {
    add(worker.home.x, worker.home.z);
  } else {
    add(hallX, 23.2);
    add(hallX, room.z);
    add(wallX + side * 0.62, room.z);
    add(wallX - side * 0.62, room.z);
    if (isDevOps) {
      const serverDoorX = SERVER_ROOM.x - SERVER_ROOM.width / 2;
      add(serverDoorX - 0.62, SERVER_ROOM.z);
      add(serverDoorX + 0.62, SERVER_ROOM.z);
    }
    add(worker.home.x, worker.home.z);
  }
  return waypoints;
}

function updateWorkers(employees) {
  const counts = new Map();
  employees.forEach((person) => {
    const workerKey = DEPARTMENTS.includes(person.department) ? person.department : "Executive";
    const index = DEPARTMENTS.indexOf(workerKey);
    const count = counts.get(workerKey) || 0;
    counts.set(workerKey, count + 1);
    const center = { x: COLS[index % 4], z: ROWS[Math.floor(index / 4)] };
    const offsets = [[-2.25, -1.5], [2.25, -1.5], [-2.25, 1.5], [2.25, 1.5]];
    const offset = offsets[count % offsets.length];
    let home = new THREE.Vector3(center.x + offset[0], WORKER_GROUND, center.z + offset[1]);
    if (workerKey === "Software Development") {
      if (/devops/i.test(person.role || "")) home.set(SERVER_ROOM.x - 0.55, WORKER_GROUND, SERVER_ROOM.z + 1.05);
      else if (/qa/i.test(person.role || "")) home.set(center.x - 3.25, WORKER_GROUND, center.z + 2.5);
      else if (count === 0) home.set(center.x - 3.35, WORKER_GROUND, center.z - 2.35);
      else home.set(center.x - 1.1, WORKER_GROUND, center.z - 2.35 + ((count % 2) * 1.5));
    }
    if (!state.workers.has(person.id)) {
      buildDesk(state.scene, { x: home.x, z: home.z - 0.58 }, DEPARTMENT_COLORS[index]);
      state.workers.set(person.id, buildWorker(person, home, DEPARTMENT_COLORS[index]));
    }
    const worker = state.workers.get(person.id);
    worker.person = person;
    worker.department = workerKey;
    worker.status = person.status;
    const departmentHsl = new THREE.Color(DEPARTMENT_COLORS[index]).getHSL({});
    worker.shirt.color.setHSL(departmentHsl.h, 0.38, 0.53);
    worker.home.copy(home);
    if (!worker.nameLabel) {
      const created = makeWorldLabel("employee", person.name, DEPARTMENT_COLORS[index]);
      worker.nameLabel = created.element;
      worker.nameLabelCopy = created.copy;
      state.labelLayer?.appendChild(worker.nameLabel);
    }
    worker.nameLabel.style.setProperty("--department-color", DEPARTMENT_COLORS[index]);
    worker.nameLabel.querySelector(".office-label-dot").style.backgroundColor = DEPARTMENT_COLORS[index];
    if (workerKey === "Software Development" && /devops/i.test(person.role || "")) {
      worker.wanderBounds = { minX: SERVER_ROOM.x - SERVER_ROOM.width / 2 + 0.55, maxX: SERVER_ROOM.x + SERVER_ROOM.width / 2 - 0.55, minZ: SERVER_ROOM.z - SERVER_ROOM.depth / 2 + 0.55, maxZ: SERVER_ROOM.z + SERVER_ROOM.depth / 2 - 0.55 };
    } else {
      worker.wanderBounds = { minX: center.x - 4.75, maxX: center.x + 4.75, minZ: center.z - 4.75, maxZ: center.z + 4.75 };
      if (workerKey === "Software Development") worker.wanderBounds.maxX = SERVER_ROOM.x - SERVER_ROOM.width / 2 - 0.4;
    }
    worker.selectionRing.visible = person.id === state.selectedEmployee;
    worker.cup.visible = person.status === "Coffee";
    if (worker.name !== person.name) {
      worker.nameLabelCopy.textContent = person.name;
      worker.name = person.name;
    }
    worker.group.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      if (child.userData.baseOpacity == null) child.userData.baseOpacity = child.material.opacity;
      if (child.userData.baseTransparent == null) child.userData.baseTransparent = child.material.transparent;
      child.material.opacity = person.status === "Offline" ? Math.min(child.userData.baseOpacity, 0.48) : child.userData.baseOpacity;
      child.material.transparent = person.status === "Offline" || child.userData.baseTransparent;
    });
    const activity = state.options.activity && state.options.activity.participantIds.includes(person.id) ? state.options.activity : null;
    worker.target = workerDestination(worker, person);
    const pathKey = activity ? activity.id + ":" + activity.type : "home";
    if (worker.pathKey !== pathKey) {
      worker.pathKey = pathKey;
      worker.path = workerRoute(worker, person, activity, worker.target);
      worker.pathIndex = 0;
      worker.wanderState = "waiting";
      worker.nextWanderAt = Date.now() + 5000 + Math.random() * 14000;
    }
    if (person.status === "Meeting" || person.status === "Speaking") {
      worker.lookTarget.set(MEETING_CENTER.x, WORKER_GROUND, MEETING_CENTER.z);
    } else if (person.status === "Coffee") worker.lookTarget.set(CAFE_CENTER.x, WORKER_GROUND, CAFE_CENTER.z);
    else worker.lookTarget.set(home.x, WORKER_GROUND, home.z - 1);
  });
  state.workers.forEach((worker, id) => {
    if (!employees.some((person) => person.id === id)) {
      state.scene.remove(worker.group);
      worker.nameLabel?.remove();
      state.workers.delete(id);
    }
  });
}

function animate(time) {
  if (!state.renderer || !state.scene || !state.visible) return;
  const delta = Math.min((time - (state.lastTime || time)) / 1000, 0.05);
  state.lastTime = time;
  state.workers.forEach((worker) => {
    const target = worker.target || worker.home;
    const now = Date.now();
    const routeFinished = worker.pathKey === "home" && worker.pathIndex >= (worker.path?.length || 1) - 1;
    const casualWalk = worker.status === "Idle" && routeFinished && !state.options.reduceMotion;
    const atHome = worker.group.position.distanceTo(worker.home) < 0.22;
    if (casualWalk) {
      if (worker.wanderState === "waiting" && atHome && now >= worker.nextWanderAt) {
        const bounds = worker.wanderBounds || { minX: worker.home.x - 3, maxX: worker.home.x + 3, minZ: worker.home.z - 3, maxZ: worker.home.z + 3 };
        const x = THREE.MathUtils.clamp(worker.home.x + (Math.random() - 0.5) * 5.4, bounds.minX, bounds.maxX);
        const z = THREE.MathUtils.clamp(worker.home.z + (Math.random() - 0.5) * 5.0, bounds.minZ, bounds.maxZ);
        worker.wanderTarget.set(x, WORKER_GROUND, z);
        worker.wanderState = "going";
      } else if (worker.wanderState === "going" && worker.group.position.distanceTo(worker.wanderTarget) < 0.14) {
        worker.wanderState = "pausing";
        worker.wanderUntil = now + 1800 + Math.random() * 2600;
      } else if (worker.wanderState === "pausing" && now >= worker.wanderUntil) {
        worker.wanderTarget.copy(worker.home);
        worker.wanderState = "returning";
      } else if (worker.wanderState === "returning" && atHome) {
        worker.wanderState = "waiting";
        worker.nextWanderAt = now + 12000 + Math.random() * 22000;
      }
    }
    const routeTarget = casualWalk && ["going", "pausing", "returning"].includes(worker.wanderState)
      ? worker.wanderTarget
      : worker.path && worker.path.length ? worker.path[Math.min(worker.pathIndex, worker.path.length - 1)] : target;
    const factor = state.options.reduceMotion ? 1 : Math.min(1, delta * 2.25);
    worker.group.position.lerp(routeTarget, factor);
    if (worker.group.position.distanceTo(routeTarget) < 0.08 && worker.pathIndex < (worker.path?.length || 0) - 1) worker.pathIndex += 1;
    const moving = worker.group.position.distanceTo(routeTarget) > 0.09;
    const facing = moving ? routeTarget : worker.lookTarget;
    worker.group.rotation.y = Math.atan2(facing.x - worker.group.position.x, facing.z - worker.group.position.z);
    const phase = time * 0.006 + worker.phase;
    const movingWave = moving && !state.options.reduceMotion ? Math.sin(phase * 2.2) * 0.62 : 0;
    const idleBob = ["Meeting", "Speaking", "Coffee"].includes(worker.status) && !state.options.reduceMotion ? Math.sin(phase) * 0.035 : 0;
    worker.leftLeg.rotation.x = movingWave;
    worker.rightLeg.rotation.x = -movingWave;
    worker.leftArm.rotation.x = -movingWave * 0.48;
    worker.rightArm.rotation.x = movingWave * 0.48;
    if (worker.status === "Speaking" && !state.options.reduceMotion) worker.rightArm.rotation.z = Math.sin(phase * 2.5) * 0.55 - 0.12;
    else worker.rightArm.rotation.z = 0;
    worker.group.position.y = WORKER_GROUND + idleBob + (moving && !state.options.reduceMotion ? Math.abs(Math.sin(phase * 2.2)) * 0.055 : 0);
  });
  state.renderer.render(state.scene, state.camera);
  updateWorldLabels();
}

function setupInteraction() {
  const canvas = state.renderer.domElement;
  let down = null;
  let dragged = false;
  const updateHover = (event) => {
    const rect = canvas.getBoundingClientRect();
    state.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    state.raycaster.setFromCamera(state.pointer, state.camera);
    const roots = Array.from(state.workers.values()).map((worker) => worker.group);
    const hit = state.raycaster.intersectObjects(roots, true).find((item) => {
      let node = item.object;
      while (node && !node.userData.employeeId) node = node.parent;
      return Boolean(node?.userData.employeeId);
    });
    let node = hit?.object;
    while (node && !node.userData.employeeId) node = node.parent;
    const worker = node ? state.workers.get(node.userData.employeeId) : null;
    state.hovered = worker?.person.id || "";
    canvas.style.cursor = down ? "grabbing" : worker ? "pointer" : "grab";
    if (state.onHover) state.onHover(worker?.person || null, event, rect);
  };
  canvas.addEventListener("pointerdown", (event) => {
    down = { x: event.clientX, y: event.clientY, azimuth: state.dragAzimuth, polar: state.polar };
    dragged = false;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!down) {
      updateHover(event);
      return;
    }
    const dx = event.clientX - down.x;
    const dy = event.clientY - down.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) dragged = true;
    if (!dragged) { updateHover(event); return; }
    if (state.onHover) state.onHover(null, event, canvas.getBoundingClientRect());
    state.dragAzimuth = down.azimuth + dx * 0.008;
    state.polar = THREE.MathUtils.clamp(down.polar + dy * 0.004, 0.44, 1.42);
    updateCameraPosition();
  });
  const release = (event) => {
    if (!down) return;
    if (!dragged) {
      const rect = canvas.getBoundingClientRect();
      state.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      state.raycaster.setFromCamera(state.pointer, state.camera);
      const hits = state.raycaster.intersectObjects(state.scene.children, true);
      const selected = hits.map((hit) => {
        let node = hit.object;
        while (node && !node.userData.employeeId) node = node.parent;
        return node?.userData.employeeId;
      }).find(Boolean);
      if (selected && state.onSelect) state.onSelect(selected);
    }
    down = null;
    canvas.classList.remove("dragging");
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener("pointerleave", (event) => {
    state.hovered = "";
    if (state.onHover) state.onHover(null, event, canvas.getBoundingClientRect());
  });
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    state.camera.zoom = THREE.MathUtils.clamp(state.camera.zoom * (event.deltaY > 0 ? 0.9 : 1.1), ZOOM_MIN, ZOOM_MAX);
    state.options.mapScale = state.camera.zoom;
    state.lastMapScale = state.camera.zoom;
    state.camera.updateProjectionMatrix();
    if (state.onZoom) state.onZoom(state.camera.zoom);
  }, { passive: false });
}

export function setOffice3DVisible(visible) {
  state.visible = visible;
  if (state.renderer) state.renderer.setAnimationLoop(visible ? animate : null);
}

export function mountOffice3D(container, employees, options = {}, onSelect, onHover, onZoom) {
  if (!state.renderer) buildOffice();
  state.container = container;
  state.visible = true;
  state.options = Object.assign({}, state.options, options);
  state.onSelect = onSelect || state.onSelect;
  state.onHover = onHover || state.onHover;
  state.onZoom = onZoom || state.onZoom;
  if (state.renderer.domElement.parentElement !== container) container.appendChild(state.renderer.domElement);
  ensureWorldLabelLayer(container);
  state.observer?.disconnect();
  state.observer = new ResizeObserver(buildCamera);
  state.observer.observe(container);
  const nextRotation = (Number(options.mapRotate) || 0) * Math.PI / 180;
  state.azimuth = 0.72 + nextRotation;
  const requestedZoom = Number(options.mapScale) || 1;
  if (state.lastMapScale == null || Math.abs(requestedZoom - state.lastMapScale) > 0.001) {
    state.camera.zoom = THREE.MathUtils.clamp(requestedZoom, ZOOM_MIN, ZOOM_MAX);
    state.lastMapScale = state.camera.zoom;
  }
  state.selectedEmployee = options.selectedEmployee || "";
  updateWorkers(employees);
  buildCamera();
  if (!state.interactionsReady) {
    setupInteraction();
    state.interactionsReady = true;
  }
  state.renderer.setAnimationLoop(animate);
  return state.renderer.domElement;
}

export function mountOfficeFallback(container, employees, options = {}, onSelect, onRetry) {
  const fallback = document.createElement("div");
  fallback.className = "office-fallback";
  fallback.setAttribute("role", "group");
  fallback.setAttribute("aria-label", "Interactive office plan");
  fallback.style.setProperty("--fallback-scale", String(Math.max(0.82, Math.min(1.35, (Number(options.mapScale) || 1.1) / 1.1))));

  const layout = document.createElement("div");
  layout.className = "office-fallback-layout";

  const header = document.createElement("div");
  header.className = "office-fallback-header";
  const headingGroup = document.createElement("div");
  const eyebrow = document.createElement("div");
  eyebrow.className = "office-fallback-eyebrow";
  eyebrow.textContent = "TEAM WORKSPACES";
  const heading = document.createElement("h2");
  heading.className = "office-fallback-title";
  heading.textContent = "Interactive office plan";
  headingGroup.append(eyebrow, heading);
  const badge = document.createElement("span");
  badge.className = "office-fallback-badge";
  badge.textContent = "2D BACKUP VIEW";
  const retryButton = document.createElement("button");
  retryButton.className = "office-fallback-retry";
  retryButton.type = "button";
  retryButton.textContent = "3D'yi yeniden dene";
  retryButton.addEventListener("click", () => onRetry?.());
  header.append(headingGroup, badge, retryButton);

  const notice = document.createElement("p");
  notice.className = "office-fallback-notice";
  notice.textContent = "3D başlatılamadı. Çalışma alanın hazır; yeniden deneyebilirsin.";

  const grid = document.createElement("div");
  grid.className = "office-fallback-grid";

  const peopleByDepartment = new Map(DEPARTMENTS.map((department) => [department, []]));
  employees.forEach((person) => {
    const department = peopleByDepartment.has(person.department) ? person.department : "Executive";
    peopleByDepartment.get(department).push(person);
  });

  DEPARTMENTS.forEach((department, index) => {
    const people = peopleByDepartment.get(department);
    const room = document.createElement("article");
    room.className = "office-fallback-room";
    room.style.setProperty("--department-color", DEPARTMENT_COLORS[index]);

    const roomHeading = document.createElement("div");
    roomHeading.className = "office-fallback-room-heading";
    const departmentName = document.createElement("h3");
    departmentName.textContent = department;
    const count = document.createElement("span");
    count.className = "office-fallback-count";
    count.textContent = people.length + " EMPLOYEE" + (people.length === 1 ? "" : "S");
    roomHeading.append(departmentName, count);

    const workstations = document.createElement("div");
    workstations.className = "office-fallback-workstations";
    people.forEach((person) => {
      const showName = options.showNames !== false;
      const teammate = document.createElement("button");
      teammate.className = "office-fallback-person" + (showName ? "" : " compact") + (person.id === options.selectedEmployee ? " selected" : "");
      teammate.type = "button";
      teammate.title = person.role || person.name;
      teammate.setAttribute("aria-label", person.name + ", " + (person.role || department));
      const dot = document.createElement("span");
      dot.className = "office-fallback-person-dot";
      const initials = document.createElement("span");
      initials.className = "office-fallback-person-initials";
      initials.textContent = String(person.name || "?").trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
      teammate.appendChild(initials);
      if (showName) teammate.appendChild(dot);
      const name = document.createElement("span");
      name.className = "office-fallback-person-name";
      name.textContent = person.name;
      if (showName) teammate.appendChild(name);
      teammate.addEventListener("click", () => onSelect?.(person.id));
      workstations.appendChild(teammate);
    });

    if (!people.length) {
      const empty = document.createElement("span");
      empty.className = "office-fallback-empty";
      empty.textContent = "No teammates yet";
      workstations.appendChild(empty);
    }

    room.append(roomHeading, workstations);
    grid.appendChild(room);
  });

  layout.append(header, notice, grid);
  fallback.appendChild(layout);
  container.replaceChildren(fallback);
  container.classList.add("office-3d-fallback");

  const rotateButton = container.closest(".office-stage")?.querySelector('[data-action="rotate-map"]');
  if (rotateButton) rotateButton.classList.add("hidden");
  return fallback;
}
