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
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const step4 = document.getElementById('step4');
const lines = document.querySelectorAll('.line');

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

// При изменении поля "Ширина проема (открытая часть)"
// нужно синхронизировать второе поле и сразу обновлять список подсистем
document.getElementById('open-width').addEventListener('input', function() {
  document.getElementById('open-range').value = this.value;
  updateSubsystemOptions();
});

document.getElementById('open-range').addEventListener('input', function() {
  document.getElementById('open-width').value = this.value;
  updateSubsystemOptions();
});
function setWidthLimits(systemKey) {
  widthInput.min = systemsData[systemKey].minWidth;
  widthInput.max = systemsData[systemKey].maxWidth;
  widthRange.min = widthInput.min;
  widthRange.max = widthInput.max;
  // Если есть доп. поле
  if(systemsData[systemKey].extraField){
    extraField.classList.remove('hidden');
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

  // Получаем значение ширины
  const width = +document.getElementById('width').value;
  const openWidth = openWidthInput ? +openWidthInput.value : null;

  Object.keys(subs).forEach(key => {
    const ss = subs[key];
    let valid;
    if(sys.extraField && openWidth !== null) {
      // For systems that rely on the open width directly
      valid = openWidth >= ss.min && openWidth <= ss.max;
      if(valid && ss.params) {
        if(ss.params.width_adjustment) {
          valid = openWidth <= width - ss.params.width_adjustment;
        } else if(ss.params.door_width_offset) {
          valid = openWidth <= width - ss.params.door_width_offset;
        }
      }
    } else {
      // Filter by total width
      valid = width >= ss.min && width <= ss.max;
      if(valid && openWidth !== null && ss.params){
        if(ss.params.width_adjustment){
          valid = openWidth <= width - ss.params.width_adjustment;
        } else if(ss.params.door_width_offset){
          valid = openWidth <= width - ss.params.door_width_offset;
        }
      }
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
  setWidthLimits(currentSystem);
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
function syncInputs(input1, input2) {
  input1.addEventListener('input',()=>{ input2.value = input1.value; });
  input2.addEventListener('input',()=>{ input1.value = input2.value; });
}
syncInputs(widthInput, widthRange);
syncInputs(heightInput, heightRange);
if(openWidthInput && openRange) {
  syncInputs(openWidthInput, openRange);
  openWidthInput.addEventListener('input', updateSubsystemOptions);
  openRange.addEventListener('input', updateSubsystemOptions);
}
widthInput.addEventListener('input', updateSubsystemOptions);
widthRange.addEventListener('input', updateSubsystemOptions);

// Назад в меню
backBtn.addEventListener('click', ()=>{
  menuDiv.classList.remove('hidden');
  formContainer.classList.add('hidden');
  step1.textContent = '•'; step2.textContent = '•'; step3.textContent = '•'; step4.textContent = '•';
  step1.classList.remove('active'); step2.classList.remove('active'); step3.classList.remove('active'); step4.classList.remove('active');
  lines.forEach(l=>l.classList.remove('active'));
});

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
calcBtn.addEventListener('click', ()=>{
  errorDiv.textContent = '';
  if(!currentSystem || !subsystem || !glass || !shotlan){
    errorDiv.textContent = 'Заполните все параметры';
    return;
  }
  let params = getParams();
  if(!params) {
    errorDiv.textContent = 'Ошибка параметров';
    return;
  }
  // Передаем в calculation.js (если логика отделена)
  if(typeof calculateSystem === 'function') {
    let res = calculateSystem(params, {
      width: +widthInput.value,
      height: +heightInput.value,
      openWidth: openWidthInput ? +openWidthInput.value : undefined,
      glass,
      shotlan,
      system: currentSystem,
      subsystem,
    });
    // здесь выводи результат в модальное окно, таблицу, alert, и т.д.
    alert('Результат будет здесь. Параметры:\n' + JSON.stringify(res, null, 2));
  } else {
    // если calculation.js не подключен, просто параметры
    alert('Параметры:\n' + JSON.stringify(params, null, 2));
  }
});
