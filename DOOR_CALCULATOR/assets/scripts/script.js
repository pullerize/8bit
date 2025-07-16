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

// ===== Формулы расчета =====
function calcDoorWidth(width, subsystem, params){
  if(!subsystem){
    const base = width / Math.max(1, params.num_doors || 1);
    const dw = Math.floor(base);
    return (base - dw > 0.4) ? dw + 1 : dw;
  }
  let raw;
  switch(subsystem){
    case '3+0': raw = (width + 35) / params.num_doors; break;
    case '4+0': raw = (width + 52) / params.num_doors; break;
    case '5+0': raw = (width + 70) / params.num_doors; break;
    case '6+0': raw = (width + 87) / params.num_doors; break;
    case '7+0': raw = (width + 105) / params.num_doors; break;
    case '8+0': raw = (width + 122) / params.num_doors; break;
    case '3+0|3+0': raw = (width + 70 - 15) / params.num_doors; break;
    case '4+0|4+0': raw = (width + 105 - 15) / params.num_doors; break;
    case '5+0|5+0': raw = (width + 140 - 15) / params.num_doors; break;
    case '6+0|6+0': raw = (width + 175 - 15) / params.num_doors; break;
    case '7+0|7+0': raw = (width + 210 - 15) / params.num_doors; break;
    case '8+0|8+0': raw = (width + 245 - 15) / params.num_doors; break;
    default:
      const clear = subsystem.replace(/[()+\s]/g, '');
      switch(clear){
        case '1': raw = width / Math.max(1, params.num_doors); break;
        case '11': raw = (width + 16) / Math.max(1, params.num_doors); break;
        case '111': raw = (width + 32) / Math.max(1, params.num_doors); break;
        case '1111': raw = (width + 32 - 15) / Math.max(1, params.num_doors); break;
        default: raw = width / Math.max(1, params.num_doors);
      }
  }
  let dw = Math.floor(raw);
  if(raw - dw > 0.4) dw += 1;
  return dw;
}

function calculateComponents(width,height,subsystem,params,glass,shotlan){
  const doorWidth = calcDoorWidth(width, subsystem, params);
  const components = [];
  const add = (name,qty,formula)=>{
    if(qty>0){
      const price = prices[name]||0;
      const sum = Math.round(qty*price*100)/100;
      components.push({name,qty,price,sum,formula});
    }
  };
  add('vertical_profile',(height<=3200?1:2)*params.num_doors,
      `(${height}<=3200?1:2)*${params.num_doors}`);
  add('cap_no_brush',(height<=3200?0.5:1)*(params.profile_cap_no_brush||0),
      `(${height}<=3200?0.5:1)*${params.profile_cap_no_brush||0}`);
  add('cap_with_brush',(height<=3200?0.5:1)*(params.profile_cap_with_brush||0),
      `(${height}<=3200?0.5:1)*${params.profile_cap_with_brush||0}`);
  add('profile_C_cap',(height<=3200?0.5:1)*(params.profile_C_cap||0),
      `(${height}<=3200?0.5:1)*${params.profile_C_cap||0}`);
  add('profile_V_cap',(height<=3200?0.5:1)*(params.profile_V_cap||0),
      `(${height}<=3200?0.5:1)*${params.profile_V_cap||0}`);
  add('horizontal_profile',(doorWidth<=1000?1:2)*params.num_doors,
      `(${doorWidth}<=1000?1:2)*${params.num_doors}`);
  add('glass_seal',Math.ceil(((doorWidth+height)*2/2500)*params.num_doors),
      `ceil(((${doorWidth}+${height})*2/2500)*${params.num_doors})`);
  add('bolts',params.num_doors*8,
      `${params.num_doors}*8`);
  add('handles',params.num_handles||0,
      `${params.num_handles||0}`);
  add('top_rail_rubber',Math.ceil((width*params.num_rails*2)/1000),
      `ceil((${width}*${params.num_rails}*2)/1000)`);
  add('door_brush_joint',
      Math.ceil((params.door_brush||0)*params.num_doors*height/1000),
      `ceil((${params.door_brush||0})*${params.num_doors}*${height}/1000)`);
  const railMult = width<=3000?0.5:(width<=6000?1:(width<=9000?1.5:2));
  const capMult = width<=3000?1:(width<=6000?2:(width<=9000?3:4));
  add('top_rails_41',railMult*params.num_rails,
      `${railMult}*${params.num_rails}`);
  add('side_rail_caps_45',railMult*params.num_side_caps,
      `${railMult}*${params.num_side_caps}`);
  add('bottom_double_caps',capMult*params.num_bottom_double_caps,
      `${capMult}*${params.num_bottom_double_caps}`);
  add('bottom_single_caps',capMult*params.num_bottom_single_caps,
      `${capMult}*${params.num_bottom_single_caps}`);
  add('rail_to_rail_connectors',Math.ceil(width/300*(params.num_rail_to_rail_connectors||0)),
      `ceil(${width}/300*${params.num_rail_to_rail_connectors||0})`);
  add('rail_to_cap_connectors',Math.ceil(width/300*(params.num_rail_to_cap_connectors||0)),
      `ceil(${width}/300*${params.num_rail_to_cap_connectors||0})`);
  add('metal_rail_aligner',Math.ceil(width/500*params.num_rails),
      `ceil(${width}/500*${params.num_rails})`);
  add('plastic_rail_aligner',Math.ceil(width/500*params.num_rails*2),
      `ceil(${width}/500*${params.num_rails}*2)`);
  add('moving_mechanism_ci',params.moving_mechanism_ci||0,
      `${params.moving_mechanism_ci||0}`);
  add('belt_connector_mechanism',params.belt_connector_mechanism||0,
      `${params.belt_connector_mechanism||0}`);
  add('belt_adapter',params.belt_adapter||0,
      `${params.belt_adapter||0}`);
  add('bottom_rollers',params.bottom_rollers||0,
      `${params.bottom_rollers||0}`);
  add('corner_rubber_joint',Math.ceil(height*2/1000*(params.corner_rubber_joint||0)),
      `ceil(${height}*2/1000*${params.corner_rubber_joint||0})`);
  add('moving_mechanism',params.moving_mechanism||0,
      `${params.moving_mechanism||0}`);
  add('fixed_mechanism',params.fixed_mechanism||0,
      `${params.fixed_mechanism||0}`);
  add('fixed_door_profile',(doorWidth-12<=970?1:2)*(params.fixed_door_profile||0),
      `(${doorWidth}-12<=970?1:2)*${params.fixed_door_profile||0}`);
  const area = width*height/1000000;
  const glassPrice = (prices.glass && prices.glass[glass]) || 0;
  components.push({name:'glass',qty:area,price:glassPrice,sum:Math.round(area*glassPrice*100)/100,formula:`${width}*${height}/1000000`});
  components.push({name:'installation',qty:area,price:prices.installation,sum:Math.round(area*prices.installation*100)/100,formula:`${width}*${height}/1000000`});
  components.push({name:'logistics',qty:1,price:prices.logistics,sum:prices.logistics,formula:'1'});
  switch(shotlan){
    case '1шт по горизонтали':{
      const divider=((doorWidth-32)<=995?1:2)*params.num_doors;
      add('divider_profile',divider,
          `(${doorWidth}-32<=995?1:2)*${params.num_doors}`);
      add('additional_glass_seal',divider*2*1000/2500,
          `${divider}*2*1000/2500`);
      add('bolts_extra',params.num_doors*8,
          `${params.num_doors}*8`);
      break;}
    case '1шт по вертикали':{
      const divider=(height<=3000?3:4)*params.num_doors;
      add('divider_profile',divider,
          `(${height}<=3000?3:4)*${params.num_doors}`);
      add('additional_glass_seal',divider*2*1000/2500,
          `${divider}*2*1000/2500`);
      add('bolts_extra',params.num_doors*8,
          `${params.num_doors}*8`);
      break;}
    case '2шт по горизонтали':{
      const divider=((doorWidth-32)<=995?1:2)*params.num_doors*2;
      add('divider_profile',divider,
          `(${doorWidth}-32<=995?1:2)*${params.num_doors}*2`);
      add('additional_glass_seal',divider*2*1000/2500,
          `${divider}*2*1000/2500`);
      add('bolts_extra',params.num_doors*16,
          `${params.num_doors}*16`);
      break;}
    case '1шт по вертикали и 1шт по горизонтали':{
      const vertical=(height<=3200?3:4)*params.num_doors;
      const horizontal=((doorWidth-32)<=995?1:2)*params.num_doors;
      const divCnt=vertical+horizontal;
      add('divider_profile',divCnt,
          `${vertical}+${horizontal}`);
      add('additional_glass_seal',divCnt*2*1000/2500,
          `${divCnt}*2*1000/2500`);
      add('bolts_extra',params.num_doors*16,
          `${params.num_doors}*16`);
      break;}
    case '1шт по вертикали и 2шт по горизонтали':{
      const vertical=(height<=3200?3:4)*params.num_doors;
      const horizontal=((doorWidth-32)<=995?1:2)*2*params.num_doors;
      const divCnt=vertical+horizontal;
      add('divider_profile',divCnt,
          `${vertical}+${horizontal}`);
      add('additional_glass_seal',divCnt*2*1000/2500,
          `${divCnt}*2*1000/2500`);
      add('bolts_extra',params.num_doors*24,
          `${params.num_doors}*24`);
      break;}
    case '1шт по вертикали и 3шт по горизонтали':{
      let adhesive=((doorWidth-32)<=995?1:((doorWidth-32)<=1995?2:3))*3+(height<=3000?3:4);
      adhesive=adhesive*2*params.num_doors;
      add('adhesive_profile',adhesive,
          `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*3+(${height}<=3000?3:4))*2*${params.num_doors}`);
      add('tape_33m',Math.ceil(adhesive/33),
          `ceil(${adhesive}/33)`);
      break;}
    case '1шт по вертикали и 4шт по горизонтали':{
      let adhesive=((doorWidth-32)<=995?1:((doorWidth-32)<=1995?2:3))*4+(height<=3000?3:4);
      adhesive=adhesive*2*params.num_doors;
      add('adhesive_profile',adhesive,
          `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*4+(${height}<=3000?3:4))*2*${params.num_doors}`);
      add('tape_33m',Math.ceil(adhesive/33),
          `ceil(${adhesive}/33)`);
      break;}
    case '1шт по вертикали и 5шт по горизонтали':{
      let adhesive=((doorWidth-32)<=995?1:((doorWidth-32)<=1995?2:3))*5+(height<=3000?3:4);
      adhesive=adhesive*2*params.num_doors;
      add('adhesive_profile',adhesive,
          `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*5+(${height}<=3000?3:4))*2*${params.num_doors}`);
      add('tape_33m',Math.ceil(adhesive/33),
          `ceil(${adhesive}/33)`);
      break;}
    case 'Очень много разделений':{
      const hBase=(doorWidth-32)<=995?1:((doorWidth-32)<=1995?2:3);
      const heightUnits=Math.ceil(height/40);
      const adhesive=hBase*heightUnits*2;
      add('adhesive_profile',adhesive,
          `${hBase}*${heightUnits}*2`);
      add('tape_33m',Math.ceil(adhesive/33),
          `ceil(${adhesive}/33)`);
      break;}
  }
  let total=0;
  components.forEach(c=>{total+=c.sum;});
  return {components,total,doorWidth};
}

function calculatePartitionComponents(widthFull,height,subsystem,params,glass,shotlan){
  const numDoors=params.num_doors||1;
  const numHandles=params.num_handles||0;
  const numRails=params.num_rails||0;
  const capNoBrush=params.profile_cap_no_brush||0;
  const capWithBrush=params.profile_cap_with_brush||0;
  const capC=params.profile_C_cap||0;
  const capV=params.profile_V_cap||0;
  const numSideCaps=params.num_side_caps||0;
  const numBotDbl=params.num_bottom_double_caps||0;
  const numBotSngl=params.num_bottom_single_caps||0;
  const numRRConn=params.num_rail_to_rail_connectors||0;
  const numRCConn=params.num_rail_to_cap_connectors||0;
  const numBrush=params.door_brush||0;
  const movMech=params.moving_mechanism||0;
  const fixMech=params.fixed_mechanism||0;
  const fixProf=params.fixed_door_profile||0;
  const offset=params.door_width_offset||0;

  let raw=(widthFull+offset)/Math.max(1,numDoors);
  let doorWidth=Math.floor(raw);
  if(raw-doorWidth>0.4) doorWidth+=1;

  const components=[];
  const add=(name,qty,formula)=>{ if(qty>0){ const p=prices[name]||0; components.push({name,qty,price:p,sum:Math.round(qty*p*100)/100,formula}); } };

  add('vertical_profile',(height<=3200?1:2)*numDoors,`(${height}<=3200?1:2)*${numDoors}`);
  add('cap_no_brush',(height<=3200?0.5:1)*capNoBrush,`(${height}<=3200?0.5:1)*${capNoBrush}`);
  add('cap_with_brush',(height<=3200?0.5:1)*capWithBrush,`(${height}<=3200?0.5:1)*${capWithBrush}`);
  add('profile_C_cap',(height<=3200?0.5:1)*capC,`(${height}<=3200?0.5:1)*${capC}`);
  add('profile_V_cap',(height<=3200?0.5:1)*capV,`(${height}<=3200?0.5:1)*${capV}`);
  add('horizontal_profile',(doorWidth<=1000?1:2)*numDoors,`(${doorWidth}<=1000?1:2)*${numDoors}`);
  add('glass_seal',Math.ceil(((doorWidth+height)*2/2500)*numDoors),`ceil(((${doorWidth}+${height})*2/2500)*${numDoors})`);
  add('bolts',numDoors*8,`${numDoors}*8`);
  add('handles',numHandles,`${numHandles}`);
  add('top_rail_rubber',Math.ceil((widthFull*numRails*2)/1000),`ceil((${widthFull}*${numRails}*2)/1000)`);
  add('door_brush_joint',Math.ceil(numBrush*numDoors*height/1000),`ceil(${numBrush}*${numDoors}*${height}/1000)`);
  const railMult=widthFull<=3000?0.5:(widthFull<=6000?1:(widthFull<=9000?1.5:2));
  const capMult=widthFull<=3000?1:(widthFull<=6000?2:(widthFull<=9000?3:4));
  add('top_rails',railMult*numRails,`${railMult}*${numRails}`);
  add('side_rail_caps_45',railMult*numSideCaps,`${railMult}*${numSideCaps}`);
  add('bottom_double_caps',capMult*numBotDbl,`${capMult}*${numBotDbl}`);
  add('bottom_single_caps',capMult*numBotSngl,`${capMult}*${numBotSngl}`);
  add('rail_to_rail_connectors',Math.ceil(widthFull/300*numRRConn),`ceil(${widthFull}/300*${numRRConn})`);
  add('rail_to_cap_connectors',Math.ceil(widthFull/300*numRCConn),`ceil(${widthFull}/300*${numRCConn})`);
  add('metal_rail_aligner',Math.ceil(widthFull/500*numRails),`ceil(${widthFull}/500*${numRails})`);
  add('plastic_rail_aligner',Math.ceil(widthFull/500*numRails*2),`ceil(${widthFull}/500*${numRails}*2)`);
  add('moving_mechanism',movMech,`${movMech}`);
  add('fixed_mechanism',fixMech,`${fixMech}`);
  add('fixed_door_profile',fixProf,`${fixProf}`);
  add('corner_rubber_joint',Math.ceil(height*2/1000),`ceil(${height}*2/1000)`);

  const area=widthFull*height/1000000;
  const gp=(prices.glass&&prices.glass[glass])||0;
  components.push({name:'glass',qty:area,price:gp,sum:Math.round(area*gp*100)/100,formula:`${widthFull}*${height}/1000000`});
  components.push({name:'installation',qty:area,price:prices.installation,sum:Math.round(area*prices.installation*100)/100,formula:`${widthFull}*${height}/1000000`});
  components.push({name:'logistics',qty:1,price:prices.logistics,sum:prices.logistics,formula:'1'});

  switch(shotlan){
    case '1шт по горизонтали':{
      const d=((doorWidth-32)<=995?1:2)*numDoors;
      add('divider_profile',d,`(${doorWidth}-32<=995?1:2)*${numDoors}`);
      add('additional_glass_seal',d*2*1000/2500,`${d}*2*1000/2500`);
      add('bolts_extra',numDoors*8,`${numDoors}*8`);
      break;}
    case '1шт по вертикали':{
      const d=(height<=3000?3:4)*numDoors;
      add('divider_profile',d,`(${height}<=3000?3:4)*${numDoors}`);
      add('additional_glass_seal',d*2*1000/2500,`${d}*2*1000/2500`);
      add('bolts_extra',numDoors*8,`${numDoors}*8`);
      break;}
    case '2шт по горизонтали':{
      const d=((doorWidth-32)<=995?1:2)*numDoors*2;
      add('divider_profile',d,`(${doorWidth}-32<=995?1:2)*${numDoors}*2`);
      add('additional_glass_seal',d*2*1000/2500,`${d}*2*1000/2500`);
      add('bolts_extra',numDoors*16,`${numDoors}*16`);
      break;}
    case '1шт по вертикали и 1шт по горизонтали':{
      const v=(height<=3200?3:4)*numDoors;
      const h=((doorWidth-32)<=995?1:2)*numDoors;
      const d=v+h;
      add('divider_profile',d,`${v}+${h}`);
      add('additional_glass_seal',d*2*1000/2500,`${d}*2*1000/2500`);
      add('bolts_extra',numDoors*16,`${numDoors}*16`);
      break;}
    case '1шт по вертикали и 2шт по горизонтали':{
      const v=(height<=3200?3:4)*numDoors;
      const h=((doorWidth-32)<=995?1:2)*2*numDoors;
      const d=v+h;
      add('divider_profile',d,`${v}+${h}`);
      add('additional_glass_seal',d*2*1000/2500,`${d}*2*1000/2500`);
      add('bolts_extra',numDoors*24,`${numDoors}*24`);
      break;}
    case '1шт по вертикали и 3шт по горизонтали':{
      let adh=((doorWidth-32)<=995?1:((doorWidth-32)<=1995?2:3))*3+(height<=3000?3:4);
      adh=adh*2*numDoors;
      add('adhesive_profile',adh,`(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*3+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m',Math.ceil(adh/33),`ceil(${adh}/33)`);
      break;}
    case '1шт по вертикали и 4шт по горизонтали':{
      let adh=((doorWidth-32)<=995?1:((doorWidth-32)<=1995?2:3))*4+(height<=3000?3:4);
      adh=adh*2*numDoors;
      add('adhesive_profile',adh,`(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*4+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m',Math.ceil(adh/33),`ceil(${adh}/33)`);
      break;}
    case '1шт по вертикали и 5шт по горизонтали':{
      let adh=((doorWidth-32)<=995?1:((doorWidth-32)<=1995?2:3))*5+(height<=3000?3:4);
      adh=adh*2*numDoors;
      add('adhesive_profile',adh,`(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*5+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m',Math.ceil(adh/33),`ceil(${adh}/33)`);
      break;}
    case 'Очень много разделений':{
      const hBase=(doorWidth-32)<=995?1:((doorWidth-32)<=1995?2:3);
      const heightUnits=Math.ceil(height/40);
      const adh=hBase*heightUnits*2;
      add('adhesive_profile',adh,`${hBase}*${heightUnits}*2`);
      add('tape_33m',Math.ceil(adh/33),`ceil(${adh}/33)`);
      break;}
  }
  let total=0;components.forEach(c=>{total+=c.sum;});
  return {components,total,doorWidth};
}

// функции для других систем опущены в этом упрощении
function performCalculation(){
  const width = parseInt(widthInput.value,10);
  const openW = parseInt(openWidthInput?.value||"0",10);
  const height = parseInt(heightInput.value,10);
  const subsystemKey = subsystem;
  const glassSel = glass;
  const shotlanSel = shotlan;
  let params = getParams();
  let res;
  if(currentSystem==='angle')
    res = calculateComponents(width,height,subsystemKey,params,glassSel,shotlanSel);
  else if(currentSystem==='sync')
    res = calculateComponents(width,height,subsystemKey,params,glassSel,shotlanSel);
  else if(currentSystem==='embedded-wall')
    res = calculateComponents(openW,height,subsystemKey,params,glassSel,shotlanSel);
  else if(currentSystem==='wall-mounted')
    res = calculateComponents(openW,height,subsystemKey,params,glassSel,shotlanSel);
  else if(currentSystem==='partition')
    res = calculateComponents(width,height,subsystemKey,params,glassSel,shotlanSel);
  else
    res = calculateComponents(width,height,subsystemKey,params,glassSel,shotlanSel);
  return res;
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
  const res = performCalculation();
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
