class TowerOfHanoiVisualizer {
  constructor() {
    this.numDisks = 3;
    this.animationSpeed = 800;
    this.isRunning = false;
    this.isPaused = false;
    this.isStepMode = false;

    this.currentMove = 0;
    this.totalMoves = 0;
    this.stepIndex = 0;

    this.animationQueue = [];
    this.currentStackState = [];

    this.towers = { A: [], B: [], C: [] };
    this.towerX = { A: 0, B: 0, C: 0 };

    this.elements = {
      numDisks: document.getElementById("num-disks"),
      speedControl: document.getElementById("speed-control"),
      startBtn: document.getElementById("start-btn"),
      pauseBtn: document.getElementById("pause-btn"),
      resetBtn: document.getElementById("reset-btn"),
      stepBtn: document.getElementById("step-btn"),
      currentMove: document.getElementById("current-move"),
      totalMoves: document.getElementById("total-moves"),
      recursionDepth: document.getElementById("recursion-depth"),
      callStack: document.getElementById("call-stack"),
    };

    this.initEvents();
    this.reset();
    this.calculateTowerCenters();
  }
  clearHighlights() {
    document
      .querySelectorAll(".active-tower, .active-frame, .active-disk")
      .forEach((el) =>
        el.classList.remove("active-tower", "active-frame", "active-disk")
      );
  }

  highlightTowers(from, to) {
    document.getElementById(`tower-${from}`)?.classList.add("active-tower");
    document.getElementById(`tower-${to}`)?.classList.add("active-tower");
  }

  /* ================= EVENTS ================= */
  initEvents() {
    this.elements.numDisks.onchange = (e) => {
      this.numDisks = +e.target.value;
      this.reset();
    };

    this.elements.speedControl.onchange = (e) => {
      this.animationSpeed = +e.target.value;
    };

    this.elements.startBtn.onclick = () => this.start();
    this.elements.pauseBtn.onclick = () => this.pause();
    this.elements.resetBtn.onclick = () => this.reset();
    this.elements.stepBtn.onclick = () => this.stepForward();
  }

  calculateTowerCenters() {
    ["A", "B", "C"].forEach((t) => {
      const el = document.getElementById(`tower-${t}`);
      if (el) {
        const r = el.getBoundingClientRect();
        this.towerX[t] = r.left + r.width / 2;
      }
    });
  }

  /* ================= RESET ================= */
  reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.isStepMode = false;
    this.stepIndex = 0;
    this.currentMove = 0;

    this.towers = { A: [], B: [], C: [] };
    for (let i = this.numDisks; i >= 1; i--) this.towers.A.push(i);

    this.totalMoves = Math.pow(2, this.numDisks) - 1;
    this.animationQueue = [];
    this.currentStackState = [];

    this.renderTowers();
    this.updateDisplay();
    this.updateCallStack();
    this.updateButtons();
  }

  /* ================= START / PAUSE ================= */
  start() {
    if (this.isPaused) return this.resume();

    this.reset();
    this.isRunning = true;
    this.generateSolution();
    this.nextStep();
    this.updateButtons();
  }

  pause() {
    this.isPaused = true;
    this.isRunning = false;
    this.updateButtons();
  }

  resume() {
    this.isPaused = false;
    this.isRunning = true;
    this.nextStep();
    this.updateButtons();
  }

  /* ================= STEP ================= */
  async stepForward() {
    if (!this.animationQueue.length) this.generateSolution();
    if (this.stepIndex >= this.animationQueue.length) return;

    this.isStepMode = true;
    await this.executeStep(this.animationQueue[this.stepIndex++]);
    this.updateButtons();
  }

  /* ================= SOLVER ================= */
  generateSolution() {
    this.animationQueue = [];
    this.solve(this.numDisks, "A", "C", "B");
  }

  solve(n, from, to, aux) {
    this.animationQueue.push({
      type: "push",
      frame: {
        text: `hanoi(${n}, ${from} → ${to})`,
        status: "active",
      },
    });

    if (n === 1) {
      this.animationQueue.push({
        type: "base",
        frame: {
          text: `hanoi(1, ${from} → ${to})`,
          status: "base-case",
        },
      });

      this.animationQueue.push({ type: "move", disk: 1, from, to });
    } else {
      this.solve(n - 1, from, aux, to);
      this.animationQueue.push({ type: "move", disk: n, from, to });
      this.solve(n - 1, aux, to, from);
    }

    this.animationQueue.push({
      type: "pop",
      frame: {
        text: `hanoi(${n}, ${from} → ${to})`,
        status: "completed",
      },
    });
  }

  /* ================= EXECUTION ================= */
  async nextStep() {
    if (!this.isRunning || this.isPaused) return;
    if (this.stepIndex >= this.animationQueue.length) return;

    await this.executeStep(this.animationQueue[this.stepIndex++]);
    setTimeout(() => this.nextStep(), this.animationSpeed);
  }

  async executeStep(step) {
    this.clearHighlights();

    if (step.type === "push") {
      this.currentStackState.push(step.frame);
      this.updateCallStack();
    }

    if (step.type === "base") {
      this.currentStackState[this.currentStackState.length - 1] = step.frame;
      this.updateCallStack();
    }

    if (step.type === "move") {
      this.highlightTowers(step.from, step.to);
      await this.animateDisk(step.disk, step.from, step.to);
    }

    if (step.type === "pop") {
      this.currentStackState[this.currentStackState.length - 1] = step.frame;
      this.updateCallStack();
      this.currentStackState.pop();
    }
  }

  /* ================= ANIMATION ================= */
  animateDisk(disk, from, to) {
    return new Promise((resolve) => {
      const diskEl = document.querySelector(`#disks-${from} .disk-${disk}`);
      if (!diskEl) return resolve();

      const dx = this.towerX[to] - this.towerX[from];

      // 🔥 disk highlight
      diskEl.classList.add("active-disk");

      this.towers[from].pop();
      this.currentMove++;

      diskEl.style.transition = `transform ${this.animationSpeed / 2}ms ease`;
      diskEl.style.transform = `translateY(-180px)`;

      setTimeout(() => {
        diskEl.style.transform = `translate(${dx}px, -180px)`;
      }, this.animationSpeed / 3);

      setTimeout(() => {
        diskEl.classList.remove("active-disk");
        this.towers[to].push(disk);
        this.renderTowers();
        resolve();
      }, this.animationSpeed);
    });
  }

  /* ================= RENDER ================= */
  renderTowers() {
    ["A", "B", "C"].forEach((t) => {
      const el = document.getElementById(`disks-${t}`);
      el.innerHTML = "";
      this.towers[t].forEach((d) => {
        const disk = document.createElement("div");
        disk.className = `disk disk-${d}`;
        disk.textContent = d;
        el.appendChild(disk);
      });
    });
    this.updateDisplay();
  }

  updateCallStack() {
    const s = this.elements.callStack;
    s.innerHTML = this.currentStackState.length
      ? this.currentStackState
          .slice()
          .reverse()
          .map((f, i) => {
            const active =
              i === this.currentStackState.length - 1 && f.status === "active"
                ? "active-frame"
                : "";
            return `<div class="frame ${f.status} ${active}">${f.text}</div>`;
          })

          .join("")
      : `<div class="stack-empty">Call stack will appear here</div>`;
  }

  updateDisplay() {
    this.elements.currentMove.textContent = this.currentMove;
    this.elements.totalMoves.textContent = this.totalMoves;
    this.elements.recursionDepth.textContent = this.currentStackState.length;
  }

  updateButtons() {
    this.elements.startBtn.disabled = this.isRunning;
    this.elements.pauseBtn.disabled = !this.isRunning;
  }
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  new TowerOfHanoiVisualizer();
});
