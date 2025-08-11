const arrayInput = document.getElementById('arrayInput');
const targetInput = document.getElementById('targetInput');
const speedEl = document.getElementById('speed');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stepBtn = document.getElementById('stepBtn');
const resetBtn = document.getElementById('resetBtn');
const treeContainer = document.getElementById('treeContainer');
const explainEl = document.getElementById('explain');
const pseudocodeEl = document.getElementById('pseudocode');
const logEl = document.getElementById('log');
const compEl = document.getElementById('comp');

let values = [];
let steps = [];
let idx = 0;
let timer = null;
let playing = false;
let comparisons = 0;
let target = null;

const pseudocode = [
  "binarySearch(A, target)",
  "  left = 0, right = A.length - 1",
  "  while left <= right:",
  "    mid = (left + right) // 2",
  "    if A[mid] == target: return mid",
  "    else if A[mid] < target: left = mid + 1",
  "    else: right = mid - 1",
  "  return not found"
];

function renderPseudocode(){
  pseudocodeEl.innerHTML = '';
  pseudocode.forEach((line, i) => {
    const d = document.createElement('div');
    d.className = 'line';
    d.dataset.line = i;
    d.textContent = (i+1).toString().padStart(2,' ') + '  ' + line;
    pseudocodeEl.appendChild(d);
  });
}
function highlightPseudo(lineIndex){
  pseudocodeEl.querySelectorAll('.line').forEach(l => l.classList.remove('active'));
  if (lineIndex == null) return;
  const el = pseudocodeEl.querySelector(`.line[data-line='${lineIndex}']`);
  if (el) el.classList.add('active');
}

function recordStep(step){
  steps.push(step);
  const row = document.createElement('div');
  row.textContent = steps.length.toString().padStart(3,' ') + ' | ' + (step.desc || step.type);
  logEl.appendChild(row);
  logEl.scrollTop = logEl.scrollHeight;
}

function buildBinarySearchSteps(arr, target){
  steps = []; logEl.innerHTML = ''; comparisons = 0; compEl.textContent = 0;
  let left = 0, right = arr.length - 1;

  while (left <= right){
    let mid = Math.floor((left + right)/2);
    comparisons++; compEl.textContent = comparisons;
    recordStep({type:'compare', left, right, mid, arraySnapshot: arr.slice(),
                desc:`Check middle index ${mid} (value ${arr[mid]})`, line:3});
    if (arr[mid] === target){
      recordStep({type:'found', mid, arraySnapshot: arr.slice(),
                  desc:`Found target ${target} at index ${mid}`, line:4});
      return;
    }
    else if (arr[mid] < target){
      recordStep({type:'move-left', left, right, mid, arraySnapshot: arr.slice(),
                  desc:`Value ${arr[mid]} < target ${target}, move right`, line:5});
      left = mid + 1;
    }
    else {
      recordStep({type:'move-right', left, right, mid, arraySnapshot: arr.slice(),
                  desc:`Value ${arr[mid]} > target ${target}, move left`, line:6});
      right = mid - 1;
    }
  }
  recordStep({type:'not-found', arraySnapshot: arr.slice(),
              desc:`Target ${target} not found.`, line:7});
}

function renderTreeForStep(step){
  const snapshot = step.arraySnapshot || values.slice();
  treeContainer.innerHTML = '';
  const levelRow = document.createElement('div');
  levelRow.className = 'level';
  snapshot.forEach((v, i) => {
    const b = document.createElement('div');
    b.className = 'box';
    b.textContent = v;
    if (i === step.mid) b.classList.add('active');
    if (step.type === 'found' && i === step.mid) b.classList.add('done');
    levelRow.appendChild(b);
  });
  treeContainer.appendChild(levelRow);
}

function showStep(i){
  if (steps.length === 0) return;
  if (i < 0) i = 0;
  if (i >= steps.length) i = steps.length - 1;
  idx = i;
  const st = steps[idx];
  renderTreeForStep(st);
  explainEl.textContent = st.desc || '';
  highlightPseudo(st.line);
}

function play(){
  if (steps.length === 0) return;
  playing = true; playBtn.disabled = true; pauseBtn.disabled = false; stepBtn.disabled = true;
  const loop = () => {
    if (!playing) return;
    if (idx >= steps.length - 1){
      playing = false; playBtn.disabled = false; pauseBtn.disabled = true; stepBtn.disabled = false;
      return;
    }
    idx++;
    showStep(idx);
    timer = setTimeout(loop, Number(speedEl.value));
  };
  timer = setTimeout(loop, Number(speedEl.value));
}

function pause(){
  playing = false; playBtn.disabled = false; pauseBtn.disabled = true; stepBtn.disabled = false;
  if (timer){ clearTimeout(timer); timer = null; }
}

function stepForward(){
  if (steps.length === 0) return;
  if (idx < steps.length - 1) idx++;
  showStep(idx);
}
function stepBackward(){
  if (steps.length === 0) return;
  if (idx > 0) idx--;
  showStep(idx);
}

function resetAll(){
  if (timer){ clearTimeout(timer); timer = null; }
  playing = false; idx = 0; steps = []; logEl.innerHTML = ''; comparisons = 0; compEl.textContent = 0;
  highlightPseudo(null);
  explainEl.textContent = 'Explanation will appear here.';
  values = parseInput();
  target = parseTarget();
  if (values.length) buildInitialView(values);
}

function buildInitialView(arr){
  treeContainer.innerHTML = '';
  const levelRow = document.createElement('div');
  levelRow.className = 'level';
  arr.forEach(v => {
    const b = document.createElement('div');
    b.className = 'box';
    b.textContent = v;
    levelRow.appendChild(b);
  });
  treeContainer.appendChild(levelRow);
}

function parseInput(){
  const raw = arrayInput.value.trim();
  if (!raw) return [];
  return raw.split(/[\s,]+/).filter(Boolean).map(x => Number(x));
}
function parseTarget(){
  return Number(targetInput.value);
}

playBtn.addEventListener('click', () => {
  resetAll();
  const arr = parseInput();
  target = parseTarget();
  if (arr.length === 0){ alert('Enter a sorted array.'); return; }
  if (isNaN(target)){ alert('Enter a target number.'); return; }
  values = arr.slice();
  renderPseudocode();
  buildBinarySearchSteps(values, target);
  showStep(0);
  play();
});
pauseBtn.addEventListener('click', pause);
stepBtn.addEventListener('click', () => {
  if (steps.length === 0){
    resetAll();
    values = parseInput();
    target = parseTarget();
    renderPseudocode();
    buildBinarySearchSteps(values, target);
    showStep(0);
    return;
  }
  stepForward();
});
resetBtn.addEventListener('click', resetAll);

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') { stepBackward(); }
  if (e.key === 'ArrowRight') { stepForward(); }
  if (e.key === ' ') { e.preventDefault(); if (playing) pause(); else play(); }
});

renderPseudocode();
resetAll();
