/* =====================================================
   GRAPH VISUALIZER – FINAL FIXED CORE LOGIC
   (SAFE, BUG-FREE, STABLE)
   ===================================================== */

/* ================= GLOBAL STATE ================= */

const svg = document.querySelector(".graph-svg");

let graph = {};
let edges = [];
let positions = {};

let nodeCount = 0;
let startNode = 0;

let speed = 600;
let isRunning = false;
let runId = 0;

let traversalPath = [];
let isPaused = false;

/* ================= COMPLEXITY MAP ================= */

const complexityMap = {
  bfs: { time: "O(V + E)", space: "O(V)" },
  dfs: { time: "O(V + E)", space: "O(V)" },
  dijkstra: { time: "O(V²)", space: "O(V)" },
};

/* ================= UTILITIES ================= */

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function rand(n) {
  return Math.floor(Math.random() * n);
}

function randWeight() {
  return Math.floor(Math.random() * 9) + 1;
}

/* ================= RESET ================= */

/* ================= SOFT RESET ================= */
/* Algorithm start ke time use hoga */
function softReset() {
  isRunning = false;

  traversalPath = [];
  clearGlow();

  // clear node & edge states
  document
    .querySelectorAll(".node")
    .forEach((n) => n.classList.remove("active", "visited"));

  document
    .querySelectorAll(".graph-svg line")
    .forEach((l) => l.classList.remove("active"));

  // reset path UI
  const list = document.getElementById("pathList");
  if (list) {
    list.innerHTML = `<span class="empty">No traversal yet</span>`;
  }
}

const btn = document.getElementById("playPauseBtn");
if (btn) btn.innerText = "▶ Resume";
isPaused = false;

/* ================= HARD RESET ================= */
/* Reset button ke liye */
function hardReset() {
  softReset();
  clearGlow();

  graph = {};
  edges = [];
  positions = {};
  nodeCount = 0;
  startNode = 0;

  svg.innerHTML = "";

  // reset headers
  const startEl = document.getElementById("pathStart");
  const algoEl = document.getElementById("pathAlgo");
  const timeEl = document.getElementById("pathTime");
  const spaceEl = document.getElementById("pathSpace");

  if (startEl) startEl.innerText = "—";
  if (algoEl) algoEl.innerText = "—";
  if (timeEl) timeEl.innerText = "—";
  if (spaceEl) spaceEl.innerText = "—";
}

/* ================= CLEAR ALL ================= */

function clearAll() {
  svg.innerHTML = "";
  graph = {};
  edges = [];
  positions = {};
  nodeCount = 0;
}

/* =====================================================
   GRAPH BUILD – CUSTOM
   ===================================================== */

function buildGraph() {
  hardReset();

  nodeCount = Number(document.getElementById("nodeCount").value);
  startNode = Number(document.getElementById("startNode").value);

  if (nodeCount < 1 || nodeCount > 30) {
    alert("Nodes must be between 1 and 30");
    return;
  }

  if (startNode < 0 || startNode >= nodeCount) {
    alert("Invalid source node");
    return;
  }

  for (let i = 0; i < nodeCount; i++) graph[i] = [];

  const raw = document.getElementById("edgesInput").value.trim();
  if (!raw) {
    alert("Please enter edges");
    return;
  }

  const lines = raw.split("\n");

  for (let line of lines) {
    const parts = line.trim().split(" ");
    if (parts.length < 2) continue;

    const u = Number(parts[0]);
    const v = Number(parts[1]);
    const w = parts[2] !== undefined ? Number(parts[2]) : 1;

    if (w < 0) {
      alert("Dijkstra does not support negative weights");
      return;
    }

    addEdge(u, v, w);
  }

  autoLayout();
  drawGraph();
}

/* =====================================================
   GRAPH BUILD – AUTO
   ===================================================== */

function buildAutoGraph() {
  hardReset();

  nodeCount = Number(document.getElementById("autoNodeCount").value);

  const srcInput = document.getElementById("autoSource");
  startNode = srcInput && srcInput.value !== "" ? Number(srcInput.value) : 0;

  if (nodeCount < 1 || nodeCount > 30) {
    alert("Choose nodes between 1 and 30");
    return;
  }

  if (startNode < 0 || startNode >= nodeCount) {
    alert("Invalid source node");
    return;
  }

  for (let i = 0; i < nodeCount; i++) graph[i] = [];

  /* ensure connected */
  for (let i = 0; i < nodeCount - 1; i++) {
    addEdge(i, i + 1, randWeight());
  }

  /* extra edges */
  const extra = Math.floor(nodeCount / 2);
  let tries = 0;

  while (edges.length < nodeCount - 1 + extra && tries < 300) {
    addEdge(rand(nodeCount), rand(nodeCount), randWeight());
    tries++;
  }

  autoLayout();
  drawGraph();
}

/* =====================================================
   EDGE HANDLER (SAFE)
   ===================================================== */

function addEdge(u, v, w) {
  if (u === v) return;
  if (u < 0 || v < 0 || u >= nodeCount || v >= nodeCount) return;
  if (graph[u].some((e) => e.to === v)) return;

  graph[u].push({ to: v, w });
  graph[v].push({ to: u, w });
  edges.push({ u, v, w });
}

/* =====================================================
   LAYOUT (MULTI-RING)
   ===================================================== */

function autoLayout() {
  const cx = 300;
  const cy = 170;

  const inner = Math.min(8, nodeCount);
  const outer = nodeCount - inner;

  positions = {};
  let idx = 0;

  const r1 = 80;
  for (let i = 0; i < inner; i++) {
    const a = (2 * Math.PI * i) / inner;
    positions[idx++] = {
      x: cx + r1 * Math.cos(a),
      y: cy + r1 * Math.sin(a),
    };
  }

  if (outer > 0) {
    const r2 = 140;
    for (let i = 0; i < outer; i++) {
      const a = (2 * Math.PI * i) / outer;
      positions[idx++] = {
        x: cx + r2 * Math.cos(a),
        y: cy + r2 * Math.sin(a),
      };
    }
  }
}

/* =====================================================
   DRAW GRAPH
   ===================================================== */

function drawGraph() {
  svg.innerHTML = "";

  edges.forEach((e) => {
    svg.innerHTML += `
      <line id="e-${e.u}-${e.v}"
        x1="${positions[e.u].x}" y1="${positions[e.u].y}"
        x2="${positions[e.v].x}" y2="${positions[e.v].y}" />
      <text
        x="${(positions[e.u].x + positions[e.v].x) / 2}"
        y="${(positions[e.u].y + positions[e.v].y) / 2 - 6}"
        font-size="12"
        fill="#e5e7eb"
      >${e.w}</text>
    `;
  });

  for (let i = 0; i < nodeCount; i++) {
    svg.innerHTML += `
      <g class="node" id="node-${i}"
        transform="translate(${positions[i].x} ${positions[i].y})">
        <circle r="18" />
        <text>${i}</text>
      </g>
    `;
  }
}

/* =====================================================
   VISUAL HELPERS
   ===================================================== */

function highlightEdge(u, v) {
  const edge =
    document.getElementById(`e-${u}-${v}`) ||
    document.getElementById(`e-${v}-${u}`);

  if (edge) edge.classList.add("active");
}

/* =====================================================
   BFS
   ===================================================== */

async function runBFS() {
  if (isRunning) return;
  if (!graph[startNode]) return alert("Build graph first");

  softReset();
  isRunning = true;
  isPaused = false;
  const btn = document.getElementById("playPauseBtn");
  if (btn) btn.innerText = "⏸ Pause";

  const myRun = ++runId;

  traversalPath = [];
  updatePathHeader("BFS");
  updatePathUI();

  const q = [startNode];
  const visited = Array(nodeCount).fill(false);
  visited[startNode] = true;

  while (q.length) {
    if (!isRunning || myRun !== runId) return;

    const u = q.shift();

    traversalPath.push(u);
    updatePathUI();

    document.getElementById(`node-${u}`).classList.add("active");
    await pauseAwareSleep(speed);

    if (myRun !== runId) return;

    document.getElementById(`node-${u}`).classList.add("visited");

    for (let v of graph[u]) {
      if (!visited[v.to]) {
        visited[v.to] = true;
        highlightEdge(u, v.to);
        q.push(v.to);
      }
    }
  }

  isRunning = false;
}

/* =====================================================
   DFS
   ===================================================== */

async function dfs(u, visited, myRun) {
  if (!isRunning || myRun !== runId) return;

  visited[u] = true;

  traversalPath.push(u);
  updatePathUI();

  document.getElementById(`node-${u}`).classList.add("active");
  await pauseAwareSleep(speed);

  if (myRun !== runId) return;

  document.getElementById(`node-${u}`).classList.add("visited");

  for (let v of graph[u]) {
    if (!visited[v.to]) {
      highlightEdge(u, v.to);
      await dfs(v.to, visited, myRun);
    }
  }
}

async function runDFS() {
  if (isRunning) return;
  if (!graph[startNode]) return alert("Build graph first");

  softReset();
  isPaused = false;
  const btn = document.getElementById("playPauseBtn");
  if (btn) btn.innerText = "⏸ Pause";

  isRunning = true;

  const myRun = ++runId;

  traversalPath = [];
  updatePathHeader("DFS");
  updatePathUI();

  await dfs(startNode, Array(nodeCount).fill(false), myRun);
  isRunning = false;
}

/* =====================================================
   DIJKSTRA
   ===================================================== */

async function runDijkstra() {
  if (isRunning) return;
  if (!graph[startNode]) return alert("Build graph first");

  const parent = Array(nodeCount).fill(null);
  const destination = nodeCount - 1;

  softReset();
  isRunning = true;
  isPaused = false;
  const btn = document.getElementById("playPauseBtn");
  if (btn) btn.innerText = "⏸ Pause";

  const myRun = ++runId;

  traversalPath = [];
  updatePathHeader("DIJKSTRA");
  updatePathUI();

  const dist = Array(nodeCount).fill(Infinity);
  const visited = Array(nodeCount).fill(false);
  dist[startNode] = 0;

  for (let i = 0; i < nodeCount; i++) {
    if (!isRunning || myRun !== runId) return;

    let u = -1;
    for (let j = 0; j < nodeCount; j++) {
      if (!visited[j] && (u === -1 || dist[j] < dist[u])) u = j;
    }

    if (u === -1) break;

    visited[u] = true;
    traversalPath.push(u);
    updatePathUI();

    document.getElementById(`node-${u}`).classList.add("active");
    await pauseAwareSleep(speed);

    if (myRun !== runId) return;

    document.getElementById(`node-${u}`).classList.add("visited");

    for (let v of graph[u]) {
      if (dist[u] + v.w < dist[v.to]) {
        dist[v.to] = dist[u] + v.w;
        parent[v.to] = u;
      }
    }
  }
  await highlightShortestPath(parent, destination);

  isRunning = false;
}

/* =====================================================
   PATH UI
   ===================================================== */

function updatePathUI() {
  const list = document.getElementById("pathList");
  const start = document.getElementById("pathStart");

  if (start) start.innerText = startNode;

  if (!list) return;

  list.innerHTML = "";

  if (traversalPath.length === 0) {
    list.innerHTML = `<span class="empty">No traversal yet</span>`;
    return;
  }

  traversalPath.forEach((n) => {
    const el = document.createElement("span");
    el.innerText = n;
    list.appendChild(el);
  });
}

function updatePathHeader(algoKey) {
  const algoEl = document.getElementById("pathAlgo");
  const timeEl = document.getElementById("pathTime");
  const spaceEl = document.getElementById("pathSpace");

  if (algoEl) algoEl.innerText = algoKey;

  const info = complexityMap[algoKey.toLowerCase()];
  timeEl.innerText = info ? info.time : "—";
  spaceEl.innerText = info ? info.space : "—";
}

async function pauseAwareSleep(ms) {
  let elapsed = 0;
  while (elapsed < ms) {
    if (!isRunning) return;
    while (isPaused) {
      await sleep(100);
    }
    await sleep(50);
    elapsed += 50;
  }
}

const playPauseBtn = document.getElementById("playPauseBtn");

playPauseBtn.addEventListener("click", () => {
  if (!isRunning) return; // algo start hi nahi hua

  if (isPaused) {
    // ▶ PLAY
    isPaused = false;
    playPauseBtn.innerText = "⏸ Pause";
  } else {
    // ⏸ PAUSE
    isPaused = true;
    playPauseBtn.innerText = "▶ Resume";
  }
});

async function highlightShortestPath(parent, dest) {
  let cur = dest;
  const path = [];

  while (cur !== null) {
    path.push(cur);
    cur = parent[cur];
  }

  path.reverse();

  for (let i = 0; i < path.length - 1; i++) {
    glowNode(path[i]);
    glowEdge(path[i], path[i + 1]);
    await pauseAwareSleep(speed);
  }

  glowNode(dest);
}

function glowNode(id) {
  const node = document.getElementById(`node-${id}`);
  if (node) node.classList.add("glow");
}

function glowEdge(u, v) {
  const edge =
    document.getElementById(`e-${u}-${v}`) ||
    document.getElementById(`e-${v}-${u}`);
  if (edge) edge.classList.add("glow");
}

function clearGlow() {
  document
    .querySelectorAll(".glow")
    .forEach((el) => el.classList.remove("glow"));
}
