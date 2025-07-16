// assets/scripts/script.js

// ===== Импортируем все глобальные данные =====
/*
  Все параметры систем лежат в systems/
  Названия компонентов — data/componentNames.js
  Опции стекол — data/glassOptions.js
  Опции шотланок — data/shotlanOptions.js
  Цены компонентов — data/prices.js
  images.js — картинки и видео
  Логика калькуляции — logic/calculation.js
  Рендер опций — ui/renderOptions.js
  Утилиты — utils/
*/

import { calculateComponents } from '../logic/calculation.js';
import { componentNames } from '../data/componentNames.js';
import { loadSaved, saveIfNeeded } from '../utils/localStorage.js';
import { formatPhone } from '../utils/phone.js';

// images.js defines window.images for non-module scripts
// expose it here for convenience
const images = window.images || {};

let currentSystem = null;
let subsystem = null;
let glass = null;
let shotlan = null;

const menuDiv = document.getElementById('menu');
const formContainer = document.getElementById('form-container');
const subsystemsDiv = document.getElementById('subsystems');
const glassDiv = document.getElementById('glass-options');
const shotlanDiv = document.getElementById('shotlan-options');
const widthInput = document.getElementById('width');
const widthRange = document.getElementById('width-range');
const heightInput = document.getElementById('height');
const heightRange = document.getElementById('height-range');
const openWidthInput = document.getElementById('open-width');
const openRange = document.getElementById('open-range');
const extraField = document.getElementById('extra-field');
const errorDiv = document.getElementById('error');
const calcBtn = document.getElementById('calc-btn');
const backBtn = document.getElementById('back');
const backTopBtn = document.getElementById('back-top');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const step4 = document.getElementById('step4');
const lines = document.querySelectorAll('.line');
// Modal elements
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const modalForm = document.getElementById('modal-form');
const modalResult = document.getElementById('modal-result');
const nameInput = document.getElementById('user-name');
const phoneInput = document.getElementById('user-phone');
const saveBox = document.getElementById('save-info');
const modalCalcBtn = document.getElementById('modal-calc');
const closeModalBtn = document.getElementById('close-modal');
const closeResultBtn = document.getElementById('close-result');
const downloadResultBtn = document.getElementById('download-result');
const modalError = document.getElementById('modal-error');
const costTableBody = document.querySelector('#cost-table tbody');
const doorWidthCell = document.getElementById('door-width');
const totalCostCell = document.getElementById('total-cost');

// Format phone and load saved data
if (phoneInput) {
  phoneInput.addEventListener('input', () => formatPhone(phoneInput));
}
if (nameInput && phoneInput && saveBox) {
  loadSaved(nameInput, phoneInput, saveBox);
}

// Импортируем массивы с опциями из data/
let glassOptions = window.glassOptions || [
  'Прозрачное',
  'Пепельное',
  'Йодовое',
  'Рифленое',
  'Зеркальное',
  'Гравированное'
];
let shotlanOptions = window.shotlanOptions || [
  "Без шотланок", "1шт по горизонтали", "2шт по горизонтали", "1шт по вертикали",
  "1шт по вертикали и 1шт по горизонтали", "1шт по вертикали и 2шт по горизонтали",
  "1шт по вертикали и 3шт по горизонтали", "1шт по вертикали и 4шт по горизонтали",
  "1шт по вертикали и 5шт по горизонтали", "Очень много разделений"
];

// ========== Вспомогательные функции ==========
function applyTooltipImages(systemKey) {
  const helpImages = images.tooltips[systemKey];
  if(helpImages){
    document.getElementById('width-tooltip').innerHTML = `<img src="${helpImages.width}">`;
    document.getElementById('height-tooltip').innerHTML = `<img src="${helpImages.height}">`;
    if(document.getElementById('open-tooltip') && helpImages.open)
      document.getElementById('open-tooltip').innerHTML = `<img src="${helpImages.open}">`;
  }
}

function setDefaultValues(systemKey) {
  if (!widthInput || !heightInput) return;
  switch (systemKey) {
    case 'angle':
    case 'sync':
    case 'cascade':
      widthInput.value = widthRange.value = 2800;
      heightInput.value = heightRange.value = 2800;
      break;
    case 'partition':
      widthInput.value = widthRange.value = 4000;
      heightInput.value = heightRange.value = 2800;
      break;
    case 'embedded-wall':
    case 'wall-mounted':
      widthInput.value = widthRange.value = 2000;
      heightInput.value = heightRange.value = 2800;
      if (openWidthInput && openRange) {
        openWidthInput.value = openRange.value = 1000;
      }
      break;
    case 'unlinked':
      widthInput.value = widthRange.value = 2000;
      heightInput.value = heightRange.value = 2800;
      break;
    default:
      heightInput.value = heightRange.value = 2800;
  }
}

function setWidthLimits(systemKey) {
  widthInput.min = systemsData[systemKey].minWidth;
  widthInput.max = systemsData[systemKey].maxWidth;
  widthRange.min = widthInput.min;
  widthRange.max = widthInput.max;
  // Если есть доп. поле
  if(systemsData[systemKey].extraField){
    extraField.classList.remove('hidden');
    if (openWidthInput && openRange) {
      openWidthInput.min = systemsData[systemKey].minWidth;
      openWidthInput.max = systemsData[systemKey].maxWidth;
      if(+openWidthInput.value < +openWidthInput.min) openWidthInput.value = openWidthInput.min;
      if(+openWidthInput.value > +openWidthInput.max) openWidthInput.value = openWidthInput.max;
      openRange.min = openWidthInput.min;
      openRange.max = openWidthInput.max;
      openRange.value = openWidthInput.value;
    }
  } else {
    extraField.classList.add('hidden');
  }
}

function updateSubsystemOptions() {
  subsystemsDiv.innerHTML = '';
  glassDiv.innerHTML = '';
  shotlanDiv.innerHTML = '';
  subsystem = null; glass = null; shotlan = null;
  let sys = systemsData[currentSystem];
  let subs = sys.subsystems;

  // Получаем значения ширины
  const width = +document.getElementById('width').value;
  const openWidth = openWidthInput && !isNaN(parseFloat(openWidthInput.value)) ? +openWidthInput.value : null;

  Object.keys(subs).forEach(key => {
    const ss = subs[key];
    let valid;
    if (sys.extraField && openWidth !== null) {
      valid = openWidth >= ss.min && openWidth <= ss.max;
    } else {
      valid = width >= ss.min && width <= ss.max;
    }
    if (!valid) return;

    const opt = document.createElement('div');
    opt.className = 'option';
    opt.innerHTML = `
      <video class="icon" muted playsinline preload="metadata" src="${(images.subsystems[currentSystem] && images.subsystems[currentSystem][key])||''}"></video>
      <span>${key}</span>
    `;
    opt.addEventListener('click', ()=> {
      document.querySelectorAll('.subsystem-list .option').forEach(o=>o.classList.remove('selected'));
      opt.classList.add('selected');
      subsystem = key;
      renderGlassOptions();
      updateShotlanOptions();
      step2.textContent = key;
      step2.classList.add('active');
      step3.textContent = '•'; step4.textContent = '•';
      step3.classList.remove('active'); step4.classList.remove('active');
      lines[0].classList.add('active');
    });
    subsystemsDiv.appendChild(opt);
  });
}
function renderGlassOptions() {
  glassDiv.innerHTML = '';
  glassOptions.forEach(opt=>{
    const div = document.createElement('div');
    div.className = 'option';
    div.innerHTML = `<img class="icon" src="${images.glass[opt]}" alt=""> <span>${opt}</span>`;
    div.addEventListener('click', ()=>{
      document.querySelectorAll('#glass-options .option').forEach(o=>o.classList.remove('selected'));
      div.classList.add('selected');
      glass = opt;
      step3.textContent = opt;
      step3.classList.add('active');
      step4.textContent = '•';
      step4.classList.remove('active');
      lines[1].classList.add('active');
    });
    glassDiv.appendChild(div);
  });
}
function updateShotlanOptions() {
  shotlanDiv.innerHTML = '';
  shotlanOptions.forEach(opt=>{
    const div = document.createElement('div');
    div.className = 'option';
    div.innerHTML = `<img class="icon" src="${images.shotlan[opt]}" alt=""><span>${opt}</span>`;
    div.addEventListener('click', ()=>{
      document.querySelectorAll('#shotlan-options .option').forEach(o=>o.classList.remove('selected'));
      div.classList.add('selected');
      shotlan = opt;
      step4.textContent = opt;
      step4.classList.add('active');
      lines[2].classList.add('active');
    });
    shotlanDiv.appendChild(div);
  });
}

// Видеопревью для систем
document.querySelectorAll('.system').forEach((btn)=>{
  const sys = btn.getAttribute('data-system');
  const v = btn.querySelector('.icon');
  if(images.systems[sys]) v.src = images.systems[sys];
btn.addEventListener('click', ()=>{
  currentSystem = sys;
  menuDiv.classList.add('hidden');
  formContainer.classList.remove('hidden');
  if (backTopBtn) backTopBtn.classList.remove('hidden');
  setWidthLimits(currentSystem);
  setDefaultValues(currentSystem);
  applyTooltipImages(currentSystem);
  updateSubsystemOptions();
  renderGlassOptions();
  updateShotlanOptions();
  step1.textContent = btn.innerText.trim();
  step1.classList.add('active');
  step2.textContent = '•'; step3.textContent = '•'; step4.textContent = '•';
  step2.classList.remove('active'); step3.classList.remove('active'); step4.classList.remove('active');
  lines.forEach(l=>l.classList.remove('active'));
});
});

// Синхронизация range/number полей
function syncInputs(input1, input2, onInput) {
  input1.addEventListener('input', () => {
    input2.value = input1.value;
    if (onInput) onInput();
  });
  input2.addEventListener('input', () => {
    input1.value = input2.value;
    if (onInput) onInput();
  });
}
syncInputs(widthInput, widthRange, updateSubsystemOptions);
syncInputs(heightInput, heightRange);
if (openWidthInput && openRange) {
  syncInputs(openWidthInput, openRange, updateSubsystemOptions);
}

function goBack(){
  menuDiv.classList.remove('hidden');
  formContainer.classList.add('hidden');
  if (backTopBtn) backTopBtn.classList.add('hidden');
  step1.textContent = '•'; step2.textContent = '•'; step3.textContent = '•'; step4.textContent = '•';
  step1.classList.remove('active'); step2.classList.remove('active'); step3.classList.remove('active'); step4.classList.remove('active');
  lines.forEach(l=>l.classList.remove('active'));
}

backBtn.addEventListener('click', goBack);
if (backTopBtn) backTopBtn.addEventListener('click', goBack);

// Img/video viewer
function openImgViewer(src, isVideo){
  const viewer = document.getElementById('img-viewer');
  const v = document.getElementById('viewer-video');
  const img = document.getElementById('viewer-img');
  viewer.classList.remove('hidden');
  if(isVideo){
    v.src = src;
    v.classList.remove('hidden');
    img.classList.add('hidden');
    v.play();
  } else {
    img.src = src;
    img.classList.remove('hidden');
    v.classList.add('hidden');
    v.pause();
  }
}
document.getElementById('img-viewer').addEventListener('click', function(e){
  if(e.target === this) this.classList.add('hidden');
  document.getElementById('viewer-video').pause();
});

// Получить параметры подсистемы (универсально)
function getParams(){
  let params = {};
  const data = systemsData[currentSystem]?.subsystems;
  if(data && data[subsystem]){
    params = data[subsystem].params;
  }
  return params;
}

// === Кнопка расчет ===
calcBtn.addEventListener('click', () => {
  errorDiv.textContent = '';
  if (!currentSystem || !subsystem || !glass || !shotlan) {
    errorDiv.textContent = 'Заполните все параметры';
    return;
  }
  modal.classList.remove('hidden');
  modalForm.classList.remove('hidden');
  modalResult.classList.add('hidden');
  modalContent.classList.add('form-mode');
  modalContent.classList.remove('result-mode');
  loadSaved(nameInput, phoneInput, saveBox);
});

modalCalcBtn.addEventListener('click', () => {
  modalError.textContent = '';
  if (!nameInput.value.trim() || phoneInput.value.replace(/\D/g, '').length < 9) {
    modalError.textContent = 'Заполните имя и телефон';
    return;
  }
  saveIfNeeded(nameInput, phoneInput, saveBox);
  const params = getParams();
  const res = calculateComponents(
    +widthInput.value,
    +heightInput.value,
    openWidthInput ? +openWidthInput.value : undefined,
    currentSystem,
    subsystem,
    params,
    glass,
    shotlan
  );
  costTableBody.innerHTML = '';
  let comps = res.components;
  if (currentSystem === 'sync') {
    const allowed = [
      'vertical_profile','cap_no_brush','cap_with_brush','profile_C_cap','profile_V_cap',
      'horizontal_profile','glass_seal','bolts','handles','top_rail_rubber','door_brush_joint',
      'top_rails_47','side_rail_caps_51','bottom_double_caps','bottom_single_caps',
      'rail_to_rail_connectors','rail_to_cap_connectors','metal_rail_aligner','plastic_rail_aligner',
      'moving_mechanism_ci','moving_mechanism_ct','fixed_mechanism','corner_rubber_joint','fixed_door_profile'
    ];
    comps = comps.filter(c => allowed.includes(c.name));
  }
  comps.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${componentNames[c.name] || c.name}</td><td>${c.qty}</td><td>${c.price}</td><td>${c.sum}</td>`;
    costTableBody.appendChild(tr);
  });
  doorWidthCell.textContent = res.doorWidth;
  totalCostCell.textContent = res.total;
  modalForm.classList.add('hidden');
  modalResult.classList.remove('hidden');
  modalContent.classList.remove('form-mode');
  modalContent.classList.add('result-mode');
});

closeModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

closeResultBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

if (downloadResultBtn) {
  downloadResultBtn.addEventListener('click', () => {
    html2pdf().from(document.getElementById('cost-table')).save();
  });
}
