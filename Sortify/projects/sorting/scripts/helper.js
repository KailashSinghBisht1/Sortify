"use strict";

class Helper {
  constructor(time, list = []) {
    this.time = Math.max(10, parseInt(400 / time));
    this.list = list;
  }

  /* ================= MARKING ================= */

  mark = async (index) => {
    if (this.list[index]) {
      this.list[index].className = "cell current";
    }
  };

  markSpl = async (index) => {
    if (this.list[index]) {
      this.list[index].className = "cell min";
    }
  };

  unmark = async (index) => {
    if (this.list[index]) {
      this.list[index].className = "cell";
    }
  };

  /* ================= PAUSE ================= */

  pause = async () => {
    // ⏸ pause loop
    while (window.isPaused && window.isPaused()) {
      await new Promise((res) => setTimeout(res, 50));
    }

    if (window.shouldStop && window.shouldStop()) return;

    return new Promise((resolve) => setTimeout(resolve, this.time));
  };

  /* ================= COMPARE ================= */

  compare = async (i, j) => {
    if (window.shouldStop && window.shouldStop()) return false;
    if (!this.list[i] || !this.list[j]) return false;

    await this.pause();

    // step count
    if (window.incrementStep) window.incrementStep();

    const a = Number(this.list[i].getAttribute("value"));
    const b = Number(this.list[j].getAttribute("value"));

    return a > b;
  };

  /* ================= SWAP ================= */

  swap = async (i, j) => {
    if (window.shouldStop && window.shouldStop()) return;
    if (!this.list[i] || !this.list[j]) return;

    await this.pause();

    // step count
    if (window.incrementStep) window.incrementStep();

    // sound
    if (window.playSwapSound) window.playSwapSound();

    const val1 = this.list[i].getAttribute("value");
    const val2 = this.list[j].getAttribute("value");

    // swap values
    this.list[i].setAttribute("value", val2);
    this.list[j].setAttribute("value", val1);

    const maxValue = Math.max(
      ...Array.from(this.list).map((el) => Number(el.getAttribute("value")))
    );

    const MAX_BAR_HEIGHT = document.querySelector(".array").clientHeight - 30;

    this.list[i].style.height = `${Math.max(
      (val2 / maxValue) * MAX_BAR_HEIGHT,
      10
    )}px`;

    this.list[j].style.height = `${Math.max(
      (val1 / maxValue) * MAX_BAR_HEIGHT,
      10
    )}px`;

    // visible numbers
    if (this.list[i].children[0]) this.list[i].children[0].innerText = val2;
    if (this.list[j].children[0]) this.list[j].children[0].innerText = val1;
  };

  /* ================= WRITE (MERGE SORT FIX) ================= */

  write = async (index, value) => {
    if (window.shouldStop && window.shouldStop()) return;
    if (!this.list[index]) return;

    await this.pause();

    // step count rahega
    if (window.incrementStep) window.incrementStep();

    // 🔕 SOUND REMOVE KAR DI
    // if (window.playSwapSound) window.playSwapSound();

    this.list[index].setAttribute("value", value);
    const maxValue = Math.max(
      ...Array.from(this.list).map((el) => Number(el.getAttribute("value")))
    );

    const MAX_BAR_HEIGHT = document.querySelector(".array").clientHeight - 30;

    this.list[index].style.height = `${Math.max(
      (value / maxValue) * MAX_BAR_HEIGHT,
      10
    )}px`;

    if (this.list[index].children[0]) {
      this.list[index].children[0].innerText = value;
    }
  };
}
