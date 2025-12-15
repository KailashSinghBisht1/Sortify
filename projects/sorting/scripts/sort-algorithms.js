"use strict";

class sortAlgorithms {
  constructor(time) {
    this.list = document.querySelectorAll(".cell");
    this.size = this.list.length;
    this.help = new Helper(time, this.list);
  }

  /* ================= BUBBLE SORT ================= */
  BubbleSort = async () => {
    for (let i = 0; i < this.size - 1; i++) {
      if (window.shouldStop()) return;

      for (let j = 0; j < this.size - i - 1; j++) {
        if (window.shouldStop()) return;

        await this.help.mark(j);
        await this.help.mark(j + 1);

        if (await this.help.compare(j, j + 1)) {
          await this.help.swap(j, j + 1);
        }

        await this.help.unmark(j);
        await this.help.unmark(j + 1);
      }

      this.list[this.size - i - 1].className = "cell done";
    }

    if (this.size > 0) this.list[0].className = "cell done";
  };

  /* ================= INSERTION SORT ================= */
  InsertionSort = async () => {
    for (let i = 0; i < this.size - 1; i++) {
      if (window.shouldStop()) return;

      let j = i;
      while (j >= 0 && (await this.help.compare(j, j + 1))) {
        if (window.shouldStop()) return;

        await this.help.mark(j);
        await this.help.mark(j + 1);
        await this.help.swap(j, j + 1);
        await this.help.unmark(j);
        await this.help.unmark(j + 1);
        j--;
      }
    }

    for (let i = 0; i < this.size; i++) {
      if (window.shouldStop()) return;
      this.list[i].className = "cell done";
    }
  };

  /* ================= SELECTION SORT ================= */
  SelectionSort = async () => {
    for (let i = 0; i < this.size; i++) {
      if (window.shouldStop()) return;

      let minIndex = i;

      for (let j = i + 1; j < this.size; j++) {
        if (window.shouldStop()) return;

        await this.help.markSpl(minIndex);
        await this.help.mark(j);

        if (await this.help.compare(minIndex, j)) {
          await this.help.unmark(minIndex);
          minIndex = j;
        }

        await this.help.unmark(j);
      }

      if (minIndex !== i) {
        await this.help.swap(minIndex, i);
      }

      this.list[i].className = "cell done";
    }
  };

  /* ================= MERGE SORT ================= */
  MergeSort = async () => {
    await this.MergeDivider(0, this.size - 1);

    for (let i = 0; i < this.size; i++) {
      if (window.shouldStop()) return;
      this.list[i].className = "cell done";
    }
  };

  MergeDivider = async (start, end) => {
    if (window.shouldStop()) return;

    if (start < end) {
      const mid = Math.floor((start + end) / 2);
      await this.MergeDivider(start, mid);
      await this.MergeDivider(mid + 1, end);
      await this.Merge(start, mid, end);
    }
  };

  Merge = async (start, mid, end) => {
    if (window.shouldStop()) return;

    let temp = [];
    let i = start;
    let j = mid + 1;

    while (i <= mid && j <= end) {
      if (window.shouldStop()) return;

      // comparison step
      if (window.incrementStep) window.incrementStep();

      const a = Number(this.list[i].getAttribute("value"));
      const b = Number(this.list[j].getAttribute("value"));

      if (a <= b) {
        temp.push(a);
        i++;
      } else {
        temp.push(b);
        j++;
      }
    }

    while (i <= mid) {
      if (window.shouldStop()) return;
      temp.push(Number(this.list[i].getAttribute("value")));
      i++;
    }

    while (j <= end) {
      if (window.shouldStop()) return;
      temp.push(Number(this.list[j].getAttribute("value")));
      j++;
    }

    for (let k = start; k <= end; k++) {
      this.list[k].className = "cell current";
    }

    // 🔥 IMPORTANT: use helper.write (sound + step)
    for (let k = start, t = 0; k <= end; k++, t++) {
      if (window.shouldStop()) return;
      await this.help.write(k, temp[t]);
    }

    for (let k = start; k <= end; k++) {
      this.list[k].className = "cell";
    }
  };

  /* ================= QUICK SORT ================= */
  QuickSort = async () => {
    await this.QuickDivider(0, this.size - 1);

    for (let i = 0; i < this.size; i++) {
      if (window.shouldStop()) return;
      this.list[i].className = "cell done";
    }
  };

  QuickDivider = async (start, end) => {
    if (window.shouldStop()) return;

    if (start < end) {
      const pivotIndex = await this.Partition(start, end);
      await this.QuickDivider(start, pivotIndex - 1);
      await this.QuickDivider(pivotIndex + 1, end);
    }
  };

  Partition = async (start, end) => {
    if (window.shouldStop()) return start;

    const pivot = Number(this.list[end].getAttribute("value"));
    let pIndex = start;

    await this.help.markSpl(end);

    for (let i = start; i < end; i++) {
      if (window.shouldStop()) return pIndex;

      await this.help.mark(i);

      // comparison step
      if (window.incrementStep) window.incrementStep();

      if (Number(this.list[i].getAttribute("value")) < pivot) {
        await this.help.swap(i, pIndex);
        pIndex++;
      }

      await this.help.unmark(i);
    }

    await this.help.swap(pIndex, end);
    await this.help.unmark(end);

    return pIndex;
  };
}
