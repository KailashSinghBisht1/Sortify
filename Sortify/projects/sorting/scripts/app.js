"use strict";

/* ================= GLOBAL STATES ================= */
let stopSorting = false;
let showValues = false;
let steps = 0;
let customArray = null;
let isSorting = false;
let isPaused = false;

/* ================= SOUND EFFECT ================= */
const swapSound = new Audio("./swap.mp3");
swapSound.volume = 0.3;

const MAX_BAR_HEIGHT = 420;

/* ================= MODAL ELEMENTS ================= */
const modal = document.getElementById("customModal");
const sizeInput = document.getElementById("customSizeInput");
const elementsInput = document.getElementById("customElementsInput");
const errorText = document.getElementById("customError");

/* ================= UI CONTROLS ================= */
const sizeMenu = document.querySelector(".size-menu");
const algoMenu = document.querySelector(".algo-menu");
const speedMenu = document.querySelector(".speed-menu");
const startBtn = document.querySelector(".start");
const toggleBtn = document.getElementById("toggleValues");

/* ================= ENABLE / DISABLE UI ================= */
const setControls = (state) => {
  sizeMenu.disabled = state;
  algoMenu.disabled = state;
  speedMenu.disabled = state;

  // <a> tag disable simulation
  toggleBtn.classList.toggle("disabled", state);
  document.getElementById("random").classList.toggle("disabled", state);
};

/* ================= START SORTING ================= */
const start = async () => {
  if (isSorting) return;

  if (document.querySelectorAll(".cell").length === 0) {
    alert("Please generate an array first");
    return;
  }

  const algoValue = Number(algoMenu.value);
  if (algoValue === 0) {
    alert("Please select an algorithm");
    return;
  }

  let speedValue = Number(speedMenu.value);
  if (speedValue === 0) speedValue = 1;

  // ✅ START STATE
  isSorting = true;
  isPaused = false;
  stopSorting = false;

  document.getElementById(
    "stop"
  ).innerHTML = `<i class="fa fa-pause"></i> Pause`;

  steps = 0;
  updateStepCount();
  setControls(true);

  updateAlgorithmInfo(algoValue);

  const algorithm = new sortAlgorithms(speedValue);

  if (algoValue === 1) await algorithm.BubbleSort();
  if (algoValue === 2) await algorithm.SelectionSort();
  if (algoValue === 3) await algorithm.InsertionSort();
  if (algoValue === 4) await algorithm.MergeSort();
  if (algoValue === 5) await algorithm.QuickSort();

  // ✅ END STATE
  isSorting = false;
  isPaused = false;

  document.getElementById("stop").innerHTML = `<i class="fa fa-stop"></i> Stop`;

  setControls(false);
};

/* ================= SIZE MENU ================= */
sizeMenu.addEventListener("change", () => {
  stopSorting = true;
  steps = 0;
  updateStepCount();

  if (sizeMenu.value === "custom") {
    openCustomModal();
  } else if (sizeMenu.value !== "0") {
    customArray = null;
    RenderScreen();
  }
});

/* ================= MODAL OPEN / CLOSE ================= */
const openCustomModal = () => {
  modal.classList.add("active");
  sizeInput.value = "";
  elementsInput.value = "";
  errorText.innerText = "";
  sizeInput.className = "";
  elementsInput.className = "";
};

const closeCustomModal = () => {
  modal.classList.remove("active");
};

/* ESC key close */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("active")) {
    closeCustomModal();
    sizeMenu.value = "0";
  }
});

/* Outside click close */
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeCustomModal();
    sizeMenu.value = "0";
  }
});

/* ================= APPLY CUSTOM ARRAY ================= */
document.getElementById("applyCustom").addEventListener("click", () => {
  const size = parseInt(sizeInput.value);
  const elements = elementsInput.value.trim().split(/\s+/).map(Number);

  sizeInput.className = "";
  elementsInput.className = "";
  errorText.innerText = "";

  if (isNaN(size) || size < 1 || size > 20) {
    sizeInput.classList.add("error");
    errorText.innerText = "Array size must be between 1 and 20";
    return;
  }

  if (elements.length !== size || elements.some(isNaN)) {
    elementsInput.classList.add("error");
    errorText.innerText = `Enter exactly ${size} numbers`;
    return;
  }

  customArray = elements;
  closeCustomModal();
  sizeMenu.value = "custom";
  RenderCustomArray(elements);
});

/* ================= CANCEL MODAL ================= */
document.getElementById("cancelCustom").addEventListener("click", () => {
  closeCustomModal();
  sizeMenu.value = "0";
});

const generateArray = async () => {
  if (isSorting) return;

  stopSorting = true;
  customArray = null;
  steps = 0;
  updateStepCount();

  const sizeValue = Number(sizeMenu.value);

  if (!sizeValue || sizeValue === 0) {
    alert("Please select array size first");
    return;
  }

  await RenderList();
};

/* ================= RENDER SCREEN ================= */
const RenderScreen = async () => {
  if (customArray) return RenderCustomArray(customArray);

  const sizeValue = Number(sizeMenu.value);
  if (!sizeValue) return;

  stopSorting = true;
  steps = 0;
  updateStepCount();
  await RenderList();
};

/* ================= RENDER RANDOM ARRAY ================= */
const RenderList = async () => {
  await clearScreen();
  const sizeValue = Number(sizeMenu.value);
  if (!sizeValue) return;

  const list = await randomList(sizeValue);
  drawArray(list);
};

/* ================= RENDER CUSTOM ARRAY ================= */
const RenderCustomArray = async (arr) => {
  await clearScreen();
  drawArray(arr);
};

const getMaxBarHeight = () => {
  const arrayContainer = document.querySelector(".array");
  return arrayContainer.clientHeight - 30; // thoda gap for labels
};

/* ================= DRAW ARRAY ================= */
const drawArray = (list) => {
  const arrayNode = document.querySelector(".array");
  const maxValue = Math.max(...list);
  const MAX_BAR_HEIGHT = getMaxBarHeight();

  list.forEach((element) => {
    const node = document.createElement("div");
    node.className = "cell";
    node.setAttribute("value", element);

    const height = Math.max(
      (element / maxValue) * MAX_BAR_HEIGHT,
      10 // minimum visible height
    );

    node.style.height = `${height}px`;

    if (showValues) {
      const span = document.createElement("span");
      span.innerText = element;
      node.appendChild(span);
    }

    arrayNode.appendChild(node);
  });
};

/* ================= RANDOM ARRAY ================= */
const randomList = async (length) =>
  Array.from({ length }, () => Math.floor(Math.random() * 100) + 1);

/* ================= CLEAR SCREEN ================= */
const clearScreen = async () => {
  document.querySelector(".array").innerHTML = "";
};

/* ================= ALGORITHM INFO ================= */
const updateAlgorithmInfo = (algoValue) => {
  const algoName = document.getElementById("algo-name");
  const algoComplexity = document.getElementById("algo-complexity");

  const map = {
    1: ["Bubble Sort", "O(n²)"],
    2: ["Selection Sort", "O(n²)"],
    3: ["Insertion Sort", "O(n²)"],
    4: ["Merge Sort", "O(n log n)"],
    5: ["Quick Sort", "Avg O(n log n)"],
  };

  algoName.innerText = "Algorithm: " + map[algoValue][0];
  algoComplexity.innerText = "Time: " + map[algoValue][1];
};

/* ================= STEP COUNTER ================= */
const updateStepCount = () => {
  document.getElementById("step-count").innerText = "Steps: " + steps;
};
window.isPaused = () => isPaused;

window.incrementStep = () => {
  steps++;
  updateStepCount();
};

/* ================= SOUND ================= */
window.playSwapSound = () => {
  swapSound.currentTime = 0;
  swapSound.play().catch(() => {});
};

/* ================= TOGGLE VALUES ================= */
toggleBtn.addEventListener("click", () => {
  if (isSorting) return; // safety

  showValues = !showValues;
  toggleBtn.innerText = showValues ? "Hide Values" : "Show Values";

  document.querySelectorAll(".cell").forEach((bar) => {
    const value = bar.getAttribute("value");

    if (showValues && !bar.children.length) {
      const span = document.createElement("span");
      span.innerText = value;
      bar.appendChild(span);
    } else if (!showValues && bar.children.length) {
      bar.removeChild(bar.children[0]);
    }
  });
});

/* ================= RESET & STOP ================= */
document.getElementById("reset").addEventListener("click", async () => {
  stopSorting = true;
  isPaused = false;
  isSorting = false;
  customArray = null;
  steps = 0;
  updateStepCount();

  await clearScreen();

  sizeMenu.value = "0";
  algoMenu.value = "0";

  document.getElementById("algo-name").innerText = "Algorithm: —";
  document.getElementById("algo-complexity").innerText = "Time: —";
  document.getElementById("stop").innerHTML = `<i class="fa fa-stop"></i> Stop`;

  setControls(false);
});

const stopBtn = document.getElementById("stop");

stopBtn.addEventListener("click", () => {
  // agar sorting hi nahi chal rahi
  if (!isSorting) return;

  // ⏸ PAUSE
  if (!isPaused) {
    isPaused = true;
    stopBtn.innerHTML = `<i class="fa fa-play"></i> Resume`;
    return;
  }

  // ▶ RESUME
  if (isPaused) {
    isPaused = false;
    stopBtn.innerHTML = `<i class="fa fa-pause"></i> Pause`;
    return;
  }
});

document.getElementById("random").addEventListener("click", () => {
  if (isSorting) return;

  stopSorting = true;
  steps = 0;
  updateStepCount();

  if (sizeMenu.value !== "0" && sizeMenu.value !== "custom") {
    RenderScreen();
  }
});

/* ================= THEME TOGGLE (FIXED) ================= */
const themeBtn = document.getElementById("themeToggle");

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");

    const icon = themeBtn.querySelector("i");

    if (document.body.classList.contains("light")) {
      icon.className = "fa fa-sun-o";
      localStorage.setItem("theme", "light");
    } else {
      icon.className = "fa fa-moon-o";
      localStorage.setItem("theme", "dark");
    }
  });
}
/* ================= LOAD SAVED THEME ================= */
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const themeBtn = document.getElementById("themeToggle");

  if (savedTheme === "light") {
    document.body.classList.add("light");
    themeBtn.querySelector("i").className = "fa fa-sun-o";
  }
});

/* ================= EVENTS ================= */
startBtn.addEventListener("click", start);
algoMenu.addEventListener("change", RenderScreen);
window.onload = () => clearScreen();

/* ================= EXPORT ================= */
window.shouldStop = () => stopSorting;
