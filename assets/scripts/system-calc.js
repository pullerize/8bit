// Получаем параметры из url
const urlParams = new URLSearchParams(window.location.search);
const systemType = urlParams.get('type');

// Элементы страницы
const backBtn = document.getElementById('back-button');
const stepsBar = document.getElementById('steps-bar');
const container = document.getElementById('calc-container');
const modal = document.getElementById('result-modal');
const userForm = document.getElementById('user-form');
const resultTable = document.getElementById('result-table');
const downloadBtn = document.getElementById('download-pdf');
const closeModal = document.getElementById('close-modal');

// Выбранные пользователем параметры
let selected = {
    subsystem: null,
    glass: null,
    shotlan: null,
    fullWidth: '',     // полная ширина проёма
    openWidth: '',     // ширина открытой части (если требуется)
    height: ''
};

// Опции и базовые данные для расчётов
const glassOptions = [
  'Прозрачное',
  'Пепельное',
  'Йодовое',
  'Рифленое',
  'Зеркальное',
  'Гравированное'
];

const shotlanOptions = [
  'Без шотланок',
  '1шт по горизонтали',
  '2шт по горизонтали',
  '1шт по вертикали',
  '1шт по вертикали и 1шт по горизонтали',
  '1шт по вертикали и 2шт по горизонтали',
  '1шт по вертикали и 3шт по горизонтали',
  '1шт по вертикали и 4шт по горизонтали',
  '1шт по вертикали и 5шт по горизонтали',
  'Очень много разделений'
];

const hideWithRiffled = [
  '1шт по вертикали и 3шт по горизонтали',
  '1шт по вертикали и 4шт по горизонтали',
  '1шт по вертикали и 5шт по горизонтали',
  'Очень много разделений'
];

const prices = {
  vertical_profile: 60,
  cap_no_brush: 25,
  cap_with_brush: 25,
  profile_C_cap: 30,
  profile_V_cap: 30,
  horizontal_profile: 27,
  glass_seal: 7,
  bolts: 0.5,
  handles: 25,
  top_rail_rubber: 0.5,
  door_brush_joint: 0.5,
  top_rails_41: 75,
  side_rail_caps_45: 35,
  side_rail_caps_51: 35,
  bottom_double_caps: 7,
  bottom_single_caps: 5,
  corner_cap: 30,
  belt_connector_mechanism: 75,
  top_rails: 75,
  top_rails_47: 70,
  rail_to_rail_connectors: 0.5,
  rail_to_cap_connectors: 0.5,
  metal_rail_aligner: 0.5,
  plastic_rail_aligner: 0.25,
  moving_mechanism_dovodchik: 75,
  moving_mechanism_belt_connector: 75,
  moving_mechanism_ci: 75,
  moving_mechanism_ct: 65,
  cable_mechanism: 65,
  moving_mechanism: 75,
  adapter_belt: 5,
  belt_connector: 75,
  belt_adapter: 5,
  bottom_rollers: 10,
  corner_rubber_joint: 0.2,
  push_mechanism: 50,
  gap_base_profile: 10,
  gap_basic_cap_profile: 7,
  gap_deco_cap_profile: 8,
  inner_support_profile: 25,
  gap_rubber: 0.2,
  fixed_door_profile: 10,
  fixed_mechanism: 35,
  corner_magnet: 8,
  wall_connector: 5,
  divider_profile: 10,
  adhesive_profile: 4,
  additional_glass_seal: 7,
  bolts_extra: 0.5,
  tape_33m: 5,
  glass: {
    'Прозрачное': 45,
    'Пепельное': 27,
    'Йодовое': 27,
    'Рифленое': 82.5,
    'Зеркальное': 96,
    'Гравированное прозрачное с 2ух сторон': 310
  },
  installation: 80,
  logistics: 50
};

const componentNames = {
  vertical_profile: 'Профиль вертикальный (6м)',
  cap_no_brush: 'Профиль заглушка без щетки (6м)',
  cap_with_brush: 'Профиль заглушка с щеткой (6м)',
  profile_C_cap: 'Профиль заглушка "C" образная (6м)',
  profile_V_cap: 'Профиль заглушка "V" образная (6м)',
  horizontal_profile: 'Профиль горизонтальный (2м)',
  glass_seal: 'Уплотнитель для стекла (2,5м)',
  bolts: 'Болты для креплений (1шт)',
  handles: 'Ручка (1шт)',
  top_rail_rubber: 'Резина для верхних рельс (1м)',
  door_brush_joint: 'Щетка для стыка 2х дверей (1м)',
  top_rails_41: 'Рельсы верхние 41мм (6м)',
  top_rails: 'Рельсы верхние 41мм (6м)',
  top_rails_47: 'Рельсы верхние 47мм (6м)',
  side_rail_caps_45: 'Заглушки боковые для рельс 45мм (6м)',
  side_rail_caps_51: 'Заглушки боковые для рельс 51мм (6м)',
  bottom_double_caps: 'Заглушки двойные для низа рельс (3м)',
  bottom_single_caps: 'Заглушки одинарные для низа рельс (3м)',
  corner_cap: 'Профиль заглушка угловая (6м)',
  rail_to_rail_connectors: 'Соединитель рельса+рельса',
  rail_to_cap_connectors: 'Соединитель рельса+профиль',
  metal_rail_aligner: 'Выравниватель для рельсы металлический (1шт)',
  plastic_rail_aligner: 'Выравниватель для рельсы пластмассовый (1шт)',
  moving_mechanism_dovodchik: 'Механизм для двигающейся двери, доводчик (комплект на 1 дверь)',
  moving_mechanism_belt_connector: 'Механизм соединительный с ремнем (комплект на 1 дверь)',
  moving_mechanism_ci: 'Механизм для двигающейся двери, доводчик (комплект на 1 дверь)',
  moving_mechanism_ct: 'Механизм для двигающейся двери с тросом (комплект на 1 дверь)',
  cable_mechanism: 'Механизм соединительный с тросом (комплект на 1 дверь)',
  moving_mechanism: 'Механизм для двигающейся двери (комплект на 1 дверь)',
  belt_connector_mechanism: 'Механизм соединительный с ремнем (комплект на 1 дверь)',
  adapter_belt: 'Дополнительные адаптеры для соединения ремня (комплект на 1 дверь)',
  belt_adapter: 'Дополнительные адаптеры для соединения ремня (комплект на 1 дверь)',
  bottom_rollers: 'Дополнительные нижние ролики для двери (комплект на 1 дверь)',
  corner_rubber_joint: 'Резинка для стыка двух дверей (1м)',
  push_mechanism: 'Механизм Push (Толкни, чтобы открыть)',
  gap_base_profile: 'Профиль - основание для закрытия щели (3м)',
  gap_basic_cap_profile: 'Профиль - заглушка базовая для закрытия щели (3м)',
  gap_deco_cap_profile: 'Профиль - заглушка декоративная для закрытия щели (3м)',
  inner_support_profile: 'Внутренняя опора для рельсы (3м)',
  gap_rubber: 'Резинка для стыка двух дверей (1м)',
  fixed_door_profile: 'Профиль для стационарной двери (2м)',
  fixed_mechanism: 'Механизм для стационарной двери (комплект на 1 дверь)',
  corner_magnet: 'Магнит для стыка угла (4шт)',
  wall_connector: 'Металлический коннектор рельсы к стене (1шт)',
  glass: 'Стекло',
  installation: 'Сборка/установка',
  logistics: 'Доп расходы (логистика и т.д.)',
  divider_profile: 'Разделительный профиль, делящий стекло (1м)',
  additional_glass_seal: 'Дополнительный уплотнитель для стекла (2,5м)',
  bolts_extra: 'Дополнительные болты для креплений (1шт)',
  adhesive_profile: 'Разделительный профиль, клеящийся на стекло (3м)',
  tape_33m: 'Специальный скотч двухсторонний (33м)'
};

let lastCalculation = null;

// Шаги расчёта
// Сначала вводим размеры, чтобы отфильтровать доступные подсистемы
const steps = [
    {name: 'Размеры', render: renderSize},
    {name: 'Подсистема', render: renderSubsystem},
    {name: 'Стекло', render: renderGlass},
    {name: 'Шотланки', render: renderShotlan},
    {name: 'Рассчитать', render: renderCalcButton}
];

function init() {
    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    renderStepsBar();
    showStep(0);
}

function renderStepsBar() {
    stepsBar.innerHTML = '';
    steps.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'step';
        if (i === 0) div.classList.add('active');
        div.textContent = s.name;
        stepsBar.appendChild(div);
    });
}

function setActiveStep(index) {
    [...stepsBar.children].forEach((el, i) => {
        el.classList.toggle('active', i === index);
    });
}

function showStep(index) {
    container.innerHTML = '';
    setActiveStep(index);
    steps[index].render(index);
}

// ----- Рендеры шагов -----
function renderSubsystem(stepIndex) {
    const system = systemsData[systemType];
    const widthVal = system.extraField ? Number(selected.openWidth) : Number(selected.fullWidth);
    const subs = Object.keys(system.subsystems).filter(key => {
        const lim = system.subsystems[key];
        return widthVal >= lim.min && widthVal <= lim.max;
    });
    const select = document.createElement('select');
    select.innerHTML = '<option value="">Выберите</option>' +
        subs.map(s => `<option value="${s}">${s}</option>`).join('');
    select.addEventListener('change', e => {
        selected.subsystem = e.target.value;
        if (selected.subsystem) showStep(stepIndex + 1);
    });
    container.appendChild(select);
}

function renderGlass(stepIndex) {
    const options = Object.keys(images.glass);
    const select = document.createElement('select');
    select.innerHTML = '<option value="">Выберите</option>' +
        options.map(o => `<option value="${o}">${o}</option>`).join('');
    select.addEventListener('change', e => {
        selected.glass = e.target.value;
        if (selected.glass) showStep(stepIndex + 1);
    });
    container.appendChild(select);
}

function renderShotlan(stepIndex) {
    let options = Object.keys(images.shotlan);
    if (selected.glass === 'Рифленое') {
        options = options.filter(o => !hideWithRiffled.includes(o));
    }
    const select = document.createElement('select');
    select.innerHTML = '<option value="">Выберите</option>' +
        options.map(o => `<option value="${o}">${o}</option>`).join('');
    select.addEventListener('change', e => {
        selected.shotlan = e.target.value;
        if (selected.shotlan) showStep(stepIndex + 1);
    });
    container.appendChild(select);
}

function renderSize(stepIndex) {
    const system = systemsData[systemType];
    const wFull = document.createElement('input');
    wFull.type = 'number';
    wFull.placeholder = 'Полная ширина проема (мм)';
    const wOpen = document.createElement('input');
    if (system.extraField) {
        wOpen.type = 'number';
        wOpen.placeholder = 'Ширина открытой части (мм)';
    }
    const h = document.createElement('input');
    h.type = 'number';
    h.placeholder = 'Высота (мм)';
    const btn = document.createElement('button');
    btn.textContent = 'Далее';
    btn.addEventListener('click', () => {
        selected.fullWidth = wFull.value;
        if (system.extraField) selected.openWidth = wOpen.value;
        selected.height = h.value;
        if (selected.fullWidth && selected.height && (!system.extraField || selected.openWidth)) {
            showStep(stepIndex + 1);
        }
    });
    container.append(wFull);
    if (system.extraField) container.append(wOpen);
    container.append(h, btn);
}

function renderCalcButton() {
    const btn = document.createElement('button');
    btn.textContent = 'Рассчитать';
    btn.addEventListener('click', () => {
        showModal();
    });
    container.appendChild(btn);
}

// ----- Модальное окно -----
function showModal() {
    modal.classList.remove('hidden');
    userForm.classList.remove('hidden');
    resultTable.classList.add('hidden');
    downloadBtn.classList.add('hidden');
}

closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

userForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('user-name').value;
    const phone = document.getElementById('user-phone').value;
    if (document.getElementById('save-user').checked) {
        localStorage.setItem('userName', name);
        localStorage.setItem('userPhone', phone);
    }
    renderResult();
});

downloadBtn.addEventListener('click', () => {
    html2pdf().from(resultTable).save();
});

function renderResult() {
    userForm.classList.add('hidden');
    resultTable.classList.remove('hidden');
    downloadBtn.classList.remove('hidden');
    const total = calculateTotal();
    let html = '<table><tr><th>Компонент</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr>';
    lastCalculation.components.forEach(c => {
        const name = componentNames[c.name] || c.name;
        html += `<tr><td>${name}</td><td>${c.qty}</td><td>${c.price}</td><td>${c.sum}</td></tr>`;
    });
    html += `</table><p>Итоговая стоимость: ${total} руб.</p>`;
    resultTable.innerHTML = html;
}

// ----- Реальные функции расчёта -----
function calcDoorWidth(width, subsystem, params) {
  if (!subsystem) {
    const base = width / Math.max(1, params.num_doors || 1);
    const dw = Math.floor(base);
    return base - dw > 0.4 ? dw + 1 : dw;
  }
  let raw;
  switch (subsystem) {
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
      switch (clear) {
        case '1': raw = width / Math.max(1, params.num_doors); break;
        case '11': raw = (width + 16) / Math.max(1, params.num_doors); break;
        case '111': raw = (width + 32) / Math.max(1, params.num_doors); break;
        case '1111': raw = (width + 32 - 15) / Math.max(1, params.num_doors); break;
        default: raw = width / Math.max(1, params.num_doors);
      }
  }
  let dw = Math.floor(raw);
  if (raw - dw > 0.4) dw += 1;
  return dw;
}

function calculateComponents(width, height, subsystem, params, glass, shotlan) {
  const doorWidth = calcDoorWidth(width, subsystem, params);
  const components = [];
  const add = (name, qty, formula) => {
    if (qty > 0) {
      const price = prices[name] || 0;
      const sum = Math.round(qty * price * 100) / 100;
      components.push({ name, qty, price, sum, formula });
    }
  };
  add('vertical_profile', (height <= 3200 ? 1 : 2) * params.num_doors,
      `(${height}<=3200?1:2)*${params.num_doors}`);
  add('cap_no_brush', (height <= 3200 ? 0.5 : 1) * (params.profile_cap_no_brush || 0),
      `(${height}<=3200?0.5:1)*${params.profile_cap_no_brush || 0}`);
  add('cap_with_brush', (height <= 3200 ? 0.5 : 1) * (params.profile_cap_with_brush || 0),
      `(${height}<=3200?0.5:1)*${params.profile_cap_with_brush || 0}`);
  add('profile_C_cap', (height <= 3200 ? 0.5 : 1) * (params.profile_C_cap || 0),
      `(${height}<=3200?0.5:1)*${params.profile_C_cap || 0}`);
  add('profile_V_cap', (height <= 3200 ? 0.5 : 1) * (params.profile_V_cap || 0),
      `(${height}<=3200?0.5:1)*${params.profile_V_cap || 0}`);
  add('horizontal_profile', (doorWidth <= 1000 ? 1 : 2) * params.num_doors,
      `(${doorWidth}<=1000?1:2)*${params.num_doors}`);
  add('glass_seal', Math.ceil(((doorWidth + height) * 2 / 2500) * params.num_doors),
      `ceil(((${doorWidth}+${height})*2/2500)*${params.num_doors})`);
  add('bolts', params.num_doors * 8,
      `${params.num_doors}*8`);
  add('handles', params.num_handles || 0,
      `${params.num_handles || 0}`);
  add('top_rail_rubber', Math.ceil((width * params.num_rails * 2) / 1000),
      `ceil((${width}*${params.num_rails}*2)/1000)`);
  add('door_brush_joint',
      Math.ceil((params.door_brush || 0) * params.num_doors * height / 1000),
      `ceil((${params.door_brush || 0})*${params.num_doors}*${height}/1000)`);
  const railMult = width <= 3000 ? 0.5 : (width <= 6000 ? 1 : (width <= 9000 ? 1.5 : 2));
  const capMult = width <= 3000 ? 1 : (width <= 6000 ? 2 : (width <= 9000 ? 3 : 4));
  add('top_rails_41', railMult * params.num_rails,
      `${railMult}*${params.num_rails}`);
  add('side_rail_caps_45', railMult * params.num_side_caps,
      `${railMult}*${params.num_side_caps}`);
  add('bottom_double_caps', capMult * params.num_bottom_double_caps,
      `${capMult}*${params.num_bottom_double_caps}`);
  add('bottom_single_caps', capMult * params.num_bottom_single_caps,
      `${capMult}*${params.num_bottom_single_caps}`);
  add('rail_to_rail_connectors', Math.ceil(width / 300 * (params.num_rail_to_rail_connectors || 0)),
      `ceil(${width}/300*${params.num_rail_to_rail_connectors || 0})`);
  add('rail_to_cap_connectors', Math.ceil(width / 300 * (params.num_rail_to_cap_connectors || 0)),
      `ceil(${width}/300*${params.num_rail_to_cap_connectors || 0})`);
  add('metal_rail_aligner', Math.ceil(width / 500 * params.num_rails),
      `ceil(${width}/500*${params.num_rails})`);
  add('plastic_rail_aligner', Math.ceil(width / 500 * params.num_rails * 2),
      `ceil(${width}/500*${params.num_rails}*2)`);
  add('moving_mechanism_ci', params.moving_mechanism_ci || 0,
      `${params.moving_mechanism_ci || 0}`);
  add('belt_connector_mechanism', params.belt_connector_mechanism || 0,
      `${params.belt_connector_mechanism || 0}`);
  add('belt_adapter', (doorWidth - 12 <= 970 ? 1 : 2) * (params.belt_adapter || 0),
      `(${doorWidth}-12<=970?1:2)*${params.belt_adapter || 0}`);
  add('bottom_rollers', params.bottom_rollers || 0,
      `${params.bottom_rollers || 0}`);
  add('corner_rubber_joint', Math.ceil(height * 2 / 1000 * (params.corner_rubber_joint || 0)),
      `ceil(${height}*2/1000*${params.corner_rubber_joint || 0})`);
  add('moving_mechanism', params.moving_mechanism || 0,
      `${params.moving_mechanism || 0}`);
  add('fixed_mechanism', params.fixed_mechanism || 0,
      `${params.fixed_mechanism || 0}`);
  add('fixed_door_profile', (doorWidth - 12 <= 970 ? 1 : 2) * (params.fixed_door_profile || 0),
      `(${doorWidth}-12<=970?1:2)*${params.fixed_door_profile || 0}`);
  const area = width * height / 1000000;
  const glassPrice = (prices.glass && prices.glass[glass]) || 0;
  components.push({ name: 'glass', qty: area, price: glassPrice, sum: Math.round(area * glassPrice * 100) / 100, formula: `${width}*${height}/1000000` });
  components.push({ name: 'installation', qty: area, price: prices.installation, sum: Math.round(area * prices.installation * 100) / 100, formula: `${width}*${height}/1000000` });
  components.push({ name: 'logistics', qty: 1, price: prices.logistics, sum: prices.logistics, formula: '1' });
  // обработка шотланок
  switch (shotlan) {
    case '1шт по горизонтали': {
      const divider = ((doorWidth - 32) <= 995 ? 1 : 2) * params.num_doors;
      add('divider_profile', divider,
          `(${doorWidth}-32<=995?1:2)*${params.num_doors}`);
      add('additional_glass_seal', divider * 2 * 1000 / 2500,
          `${divider}*2*1000/2500`);
      add('bolts_extra', params.num_doors * 8,
          `${params.num_doors}*8`);
      break; }
    case '1шт по вертикали': {
      const divider = (height <= 3000 ? 3 : 4) * params.num_doors;
      add('divider_profile', divider,
          `(${height}<=3000?3:4)*${params.num_doors}`);
      add('additional_glass_seal', divider * 2 * 1000 / 2500,
          `${divider}*2*1000/2500`);
      add('bolts_extra', params.num_doors * 8,
          `${params.num_doors}*8`);
      break; }
    case '2шт по горизонтали': {
      const divider = ((doorWidth - 32) <= 995 ? 1 : 2) * params.num_doors * 2;
      add('divider_profile', divider,
          `(${doorWidth}-32<=995?1:2)*${params.num_doors}*2`);
      add('additional_glass_seal', divider * 2 * 1000 / 2500,
          `${divider}*2*1000/2500`);
      add('bolts_extra', params.num_doors * 16,
          `${params.num_doors}*16`);
      break; }
    case '1шт по вертикали и 1шт по горизонтали': {
      const vertical = (height <= 3200 ? 3 : 4) * params.num_doors;
      const horizontal = ((doorWidth - 32) <= 995 ? 1 : 2) * params.num_doors;
      const divCnt = vertical + horizontal;
      add('divider_profile', divCnt,
          `${vertical}+${horizontal}`);
      add('additional_glass_seal', divCnt * 2 * 1000 / 2500,
          `${divCnt}*2*1000/2500`);
      add('bolts_extra', params.num_doors * 16,
          `${params.num_doors}*16`);
      break; }
    case '1шт по вертикали и 2шт по горизонтали': {
      const vertical = (height <= 3200 ? 3 : 4) * params.num_doors;
      const horizontal = ((doorWidth - 32) <= 995 ? 1 : 2) * 2 * params.num_doors;
      const divCnt = vertical + horizontal;
      add('divider_profile', divCnt,
          `${vertical}+${horizontal}`);
      add('additional_glass_seal', divCnt * 2 * 1000 / 2500,
          `${divCnt}*2*1000/2500`);
      add('bolts_extra', params.num_doors * 24,
          `${params.num_doors}*24`);
      break; }
    case '1шт по вертикали и 3шт по горизонтали': {
      let adhesive = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 3 + (height <= 3000 ? 3 : 4);
      adhesive = adhesive * 2 * params.num_doors;
      add('adhesive_profile', adhesive,
          `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*3+(${height}<=3000?3:4))*2*${params.num_doors}`);
      add('tape_33m', Math.ceil(adhesive / 33),
          `ceil(${adhesive}/33)`);
      break; }
    case '1шт по вертикали и 4шт по горизонтали': {
      let adhesive = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 4 + (height <= 3000 ? 3 : 4);
      adhesive = adhesive * 2 * params.num_doors;
      add('adhesive_profile', adhesive,
          `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*4+(${height}<=3000?3:4))*2*${params.num_doors}`);
      add('tape_33m', Math.ceil(adhesive / 33),
          `ceil(${adhesive}/33)`);
      break; }
    case '1шт по вертикали и 5шт по горизонтали': {
      let adhesive = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 5 + (height <= 3000 ? 3 : 4);
      adhesive = adhesive * 2 * params.num_doors;
      add('adhesive_profile', adhesive,
          `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*5+(${height}<=3000?3:4))*2*${params.num_doors}`);
      add('tape_33m', Math.ceil(adhesive / 33),
          `ceil(${adhesive}/33)`);
      break; }
    case 'Очень много разделений': {
      const hBase = (doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3);
      const heightUnits = Math.ceil(height / 40);
      const adhesive = hBase * heightUnits * 2;
      add('adhesive_profile', adhesive,
          `${hBase}*${heightUnits}*2`);
      add('tape_33m', Math.ceil(adhesive / 33),
          `ceil(${adhesive}/33)`);
      break; }
  }
  let total = 0;
  components.forEach(c => { total += c.sum; });
  return { components, total, doorWidth };
}

function calculatePartitionComponents(widthFull, height, subsystem, params, glass, shotlan) {
  const numDoors = params.num_doors || 1;
  const numHandles = params.num_handles || 0;
  const numRails = params.num_rails || 0;
  const capNoBrush = params.profile_cap_no_brush || 0;
  const capWithBrush = params.profile_cap_with_brush || 0;
  const capC = params.profile_C_cap || 0;
  const capV = params.profile_V_cap || 0;
  const numSideCaps = params.num_side_caps || 0;
  const numBotDbl = params.num_bottom_double_caps || 0;
  const numBotSngl = params.num_bottom_single_caps || 0;
  const numRRConn = params.num_rail_to_rail_connectors || 0;
  const numRCConn = params.num_rail_to_cap_connectors || 0;
  const numBrush = params.door_brush || 0;
  const movMech = params.moving_mechanism || 0;
  const fixMech = params.fixed_mechanism || 0;
  const fixProf = params.fixed_door_profile || 0;
  const offset = params.door_width_offset || 0;

  let raw = (widthFull + offset) / Math.max(1, numDoors);
  let doorWidth = Math.floor(raw);
  if (raw - doorWidth > 0.4) doorWidth += 1;

  const components = [];
  const add = (name, qty, formula) => { if (qty > 0) { const p = prices[name] || 0; components.push({ name, qty, price: p, sum: Math.round(qty * p * 100) / 100, formula }); } };

  add('vertical_profile', (height <= 3200 ? 1 : 2) * numDoors, `(${height}<=3200?1:2)*${numDoors}`);
  add('cap_no_brush', (height <= 3200 ? 0.5 : 1) * capNoBrush, `(${height}<=3200?0.5:1)*${capNoBrush}`);
  add('cap_with_brush', (height <= 3200 ? 0.5 : 1) * capWithBrush, `(${height}<=3200?0.5:1)*${capWithBrush}`);
  add('profile_C_cap', (height <= 3200 ? 0.5 : 1) * capC, `(${height}<=3200?0.5:1)*${capC}`);
  add('profile_V_cap', (height <= 3200 ? 0.5 : 1) * capV, `(${height}<=3200?0.5:1)*${capV}`);
  add('horizontal_profile', (doorWidth <= 1000 ? 1 : 2) * numDoors, `(${doorWidth}<=1000?1:2)*${numDoors}`);
  add('glass_seal', Math.ceil(((doorWidth + height) * 2 / 2500) * numDoors), `ceil(((${doorWidth}+${height})*2/2500)*${numDoors})`);
  add('bolts', numDoors * 8, `${numDoors}*8`);
  add('handles', numHandles, `${numHandles}`);
  add('top_rail_rubber', Math.ceil((widthFull * numRails * 2) / 1000), `ceil((${widthFull}*${numRails}*2)/1000)`);
  add('door_brush_joint', Math.ceil(numBrush * numDoors * height / 1000), `ceil(${numBrush}*${numDoors}*${height}/1000)`);
  const railMult = widthFull <= 3000 ? 0.5 : (widthFull <= 6000 ? 1 : (widthFull <= 9000 ? 1.5 : 2));
  const capMult = widthFull <= 3000 ? 1 : (widthFull <= 6000 ? 2 : (widthFull <= 9000 ? 3 : 4));
  add('top_rails', railMult * numRails, `${railMult}*${numRails}`);
  add('side_rail_caps_45', railMult * numSideCaps, `${railMult}*${numSideCaps}`);
  add('bottom_double_caps', capMult * numBotDbl, `${capMult}*${numBotDbl}`);
  add('bottom_single_caps', capMult * numBotSngl, `${capMult}*${numBotSngl}`);
  add('rail_to_rail_connectors', Math.ceil(widthFull / 300 * numRRConn), `ceil(${widthFull}/300*${numRRConn})`);
  add('rail_to_cap_connectors', Math.ceil(widthFull / 300 * numRCConn), `ceil(${widthFull}/300*${numRCConn})`);
  add('metal_rail_aligner', Math.ceil(widthFull / 500 * numRails), `ceil(${widthFull}/500*${numRails})`);
  add('plastic_rail_aligner', Math.ceil(widthFull / 500 * numRails * 2), `ceil(${widthFull}/500*${numRails}*2)`);
  add('moving_mechanism', movMech, `${movMech}`);
  add('fixed_mechanism', fixMech, `${fixMech}`);
  add('fixed_door_profile', fixProf, `${fixProf}`);
  add('corner_rubber_joint', Math.ceil(height * 2 / 1000), `ceil(${height}*2/1000)`);

  const area = widthFull * height / 1000000;
  const gp = (prices.glass && prices.glass[glass]) || 0;
  components.push({ name: 'glass', qty: area, price: gp, sum: Math.round(area * gp * 100) / 100, formula: `${widthFull}*${height}/1000000` });
  components.push({ name: 'installation', qty: area, price: prices.installation, sum: Math.round(area * prices.installation * 100) / 100, formula: `${widthFull}*${height}/1000000` });
  components.push({ name: 'logistics', qty: 1, price: prices.logistics, sum: prices.logistics, formula: '1' });

  switch (shotlan) {
    case '1шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '1шт по вертикали': {
      const d = (height <= 3000 ? 3 : 4) * numDoors;
      add('divider_profile', d, `(${height}<=3000?3:4)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '2шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors * 2;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}*2`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 1шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 2шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * 2 * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 24, `${numDoors}*24`);
      break; }
    case '1шт по вертикали и 3шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 3 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*3+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 4шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 4 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*4+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 5шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 5 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*5+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case 'Очень много разделений': {
      const hBase = (doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3);
      const heightUnits = Math.ceil(height / 40);
      const adh = hBase * heightUnits * 2;
      add('adhesive_profile', adh, `${hBase}*${heightUnits}*2`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
  }
  let total = 0; components.forEach(c => { total += c.sum; });
  return { components, total, doorWidth };
}

function calculateWallMountedComponents(widthFull, openWidth, height, subsystem, params, glass, shotlan) {
  const numDoors = params.num_doors || 1;
  let raw;
  switch (subsystem) {
    case 'Система 1W': raw = (openWidth + 16) / numDoors; break;
    case 'Система 1W+1W': raw = (openWidth + 32) / numDoors; break;
    case 'Система 1SW+1SW': raw = (openWidth + 32 - 15) / numDoors; break;
    default: raw = openWidth / numDoors;
  }
  let doorWidth = Math.floor(raw);
  if (raw - doorWidth > 0.4) doorWidth += 1;

  const components = [];
  const add = (n, q, f) => { if (q > 0) { const p = prices[n] || 0; components.push({ name: n, qty: q, price: p, sum: Math.round(q * p * 100) / 100, formula: f }); } };

  add('vertical_profile', (height <= 3200 ? 1 : 2) * numDoors, `(${height}<=3200?1:2)*${numDoors}`);
  add('cap_no_brush', (height <= 3200 ? 0.5 : 1) * (params.profile_cap_no_brush || 0), `(${height}<=3200?0.5:1)*${params.profile_cap_no_brush || 0}`);
  add('cap_with_brush', (height <= 3200 ? 0.5 : 1) * (params.cap_with_brush || 0), `(${height}<=3200?0.5:1)*${params.cap_with_brush || 0}`);
  add('profile_C_cap', (height <= 3200 ? 0.5 : 1) * (params.profile_C_cap || 0), `(${height}<=3200?0.5:1)*${params.profile_C_cap || 0}`);
  add('profile_V_cap', (height <= 3200 ? 0.5 : 1) * (params.profile_V_cap || 0), `(${height}<=3200?0.5:1)*${params.profile_V_cap || 0}`);
  add('horizontal_profile', (doorWidth <= 1000 ? 1 : 2) * numDoors, `(${doorWidth}<=1000?1:2)*${numDoors}`);
  add('glass_seal', Math.ceil(((doorWidth + height) * 2 / 2500) * numDoors), `ceil(((${doorWidth}+${height})*2/2500)*${numDoors})`);
  add('bolts', numDoors * 8, `${numDoors}*8`);
  add('handles', params.num_handles || 0, `${params.num_handles || 0}`);
  add('top_rail_rubber', Math.ceil((widthFull * (params.num_rails_41 || 0) * 2) / 1000), `ceil((${widthFull}*${params.num_rails_41 || 0}*2)/1000)`);
  add('door_brush_joint', Math.ceil((params.door_brush || 0) * numDoors * height / 1000), `ceil((${params.door_brush || 0})*${numDoors}*${height}/1000)`);
  const railMult = widthFull <= 3000 ? 0.5 : 1;
  const capMult = widthFull <= 3000 ? 1 : 2;
  add('top_rails_41', railMult * (params.num_rails_41 || 0), `${railMult}*${params.num_rails_41 || 0}`);
  add('top_rails_47', railMult * (params.num_rails_47 || 0), `${railMult}*${params.num_rails_47 || 0}`);
  add('side_rail_caps_45', railMult * (params.num_side_caps_45 || 0), `${railMult}*${params.num_side_caps_45 || 0}`);
  add('side_rail_caps_51', railMult * (params.num_side_caps_51 || 0), `${railMult}*${params.num_side_caps_51 || 0}`);
  add('bottom_single_caps', capMult * (params.num_bottom_single_caps || 0), `${capMult}*${params.num_bottom_single_caps || 0}`);
  add('bottom_double_caps', capMult * (params.num_bottom_double_caps || 0), `${capMult}*${params.num_bottom_double_caps || 0}`);
  const numRCConn = params.num_rcconn ?? params.num_rail_to_cap_connectors ?? 0;
  const numRRConn = params.num_rrconn ?? params.num_rail_to_rail_connectors ?? 0;
  add('rail_to_cap_connectors', Math.ceil(widthFull / 300 * numRCConn), `ceil(${widthFull}/300*${numRCConn})`);
  add('rail_to_rail_connectors', numRRConn, `${numRRConn}`);
  add('metal_rail_aligner', Math.ceil(widthFull / 500 * (params.num_rails_41 || 0)), `ceil(${widthFull}/500*${params.num_rails_41 || 0})`);
  add('plastic_rail_aligner', Math.ceil(widthFull / 500 * (params.num_rails_41 || 0) * 2), `ceil(${widthFull}/500*${params.num_rails_41 || 0}*2)`);
  add('wall_connector', Math.ceil(widthFull / 400), `ceil(${widthFull}/400)`);
  const nci = params.n_ci ?? params.moving_mechanism_ci ?? 0;
  const nct = params.n_ct ?? params.moving_mechanism_ct ?? 0;
  add('moving_mechanism_ci', nci, `${nci}`);
  add('moving_mechanism_ct', nct, `${nct}`);
  add('belt_adapter', (doorWidth - 12 <= 970 ? 1 : 2) * (params.belt_adapter || 0), `(${doorWidth}-12<=970?1:2)*${params.belt_adapter || 0}`);
  add('bottom_rollers', params.bottom_rollers || 0, `${params.bottom_rollers || 0}`);
  add('corner_rubber_joint', Math.ceil((params.corner_rubber_joint || 0) * 2 * height / 1000), `ceil(${params.corner_rubber_joint || 0}*2*${height}/1000)`);
  add('fixed_door_profile', (doorWidth - 12 <= 970 ? 1 : 2) * (params.fixed_door_profile || 0), `(${doorWidth}-12<=970?1:2)*${params.fixed_door_profile || 0}`);

  const area = openWidth * height / 1000000;
  const gp = (prices.glass && prices.glass[glass]) || 0;
  components.push({ name: 'glass', qty: area, price: gp, sum: Math.round(area * gp * 100) / 100, formula: `${openWidth}*${height}/1000000` });
  components.push({ name: 'installation', qty: area, price: prices.installation, sum: Math.round(area * prices.installation * 100) / 100, formula: `${openWidth}*${height}/1000000` });
  components.push({ name: 'logistics', qty: 1, price: prices.logistics, sum: prices.logistics, formula: '1' });

  switch (shotlan) {
    case '1шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '1шт по вертикали': {
      const d = (height <= 3000 ? 3 : 4) * numDoors;
      add('divider_profile', d, `(${height}<=3000?3:4)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '2шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors * 2;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}*2`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 1шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 2шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * 2 * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 24, `${numDoors}*24`);
      break; }
    case '1шт по вертикали и 3шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 3 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*3+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 4шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 4 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*4+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 5шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 5 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*5+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case 'Очень много разделений': {
      const hBase = (doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3);
      const heightUnits = Math.ceil(height / 40);
      const adh = hBase * heightUnits * 2;
      add('adhesive_profile', adh, `${hBase}*${heightUnits}*2`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
  }
  let total = 0; components.forEach(c => { total += c.sum; });
  return { components, total, doorWidth };
}

function calculateAngleComponents(widthFull, height, subsystem, params, glass, shotlan) {
  const numDoors = params.doors || 1;
  const numHandles = params.handles || 0;
  const numRails = params.rails || 0;
  const capNoBrush = params.cap_no_brush || 0;
  const capWithBrush = params.cap_with_brush || 0;
  const capCorner = params.corner_cap || 0;
  const numSideCaps = params.side_rail_caps_45 || 0;
  const numBotDbl = params.bottom_double_caps || 0;
  const numBotSngl = params.bottom_single_caps || 0;
  const numRRConn = params.rail_to_rail_connectors || 0;
  const numRCConn = params.rail_to_cap_connectors || 0;
  const numMovDov = params.moving_mechanism_dovodchik || 0;
  const numMovBelt = params.moving_mechanism_belt_connector || 0;
  const numAdapter = params.adapter_belt || 0;
  const perDoorBrush = params.door_brush_joint || 0;
  const numRubCorner = params.corner_rubber_joint || 0;
  const numRollers = params.bottom_rollers || 0;
  const numFixProf = params.fixed_door_profile || 0;
  const numFixMech = params.fixed_mechanism || 0;
  const widthAdj = params.width_adjustment || 0;

  let raw = (widthFull + widthAdj - 15) / Math.max(1, numDoors);
  let doorWidth = Math.floor(raw);
  if (raw - doorWidth > 0.4) doorWidth += 1;

  const components = [];
  const add = (name, qty, formula) => { if (qty > 0) { const p = prices[name] || 0; components.push({ name, qty, price: p, sum: Math.round(qty * p * 100) / 100, formula }); } };

  add('vertical_profile', (height <= 3200 ? 1 : 2) * numDoors,
      `(${height}<=3200?1:2)*${numDoors}`);
  add('cap_no_brush', (height <= 3200 ? 0.5 : 1) * capNoBrush,
      `(${height}<=3200?0.5:1)*${capNoBrush}`);
  add('cap_with_brush', (height <= 3200 ? 0.5 : 1) * capWithBrush,
      `(${height}<=3200?0.5:1)*${capWithBrush}`);
  add('corner_cap', (height <= 3200 ? 0.5 : 1) * capCorner,
      `(${height}<=3200?0.5:1)*${capCorner}`);
  add('horizontal_profile', (doorWidth <= 1000 ? 1 : 2) * numDoors,
      `(${doorWidth}<=1000?1:2)*${numDoors}`);
  add('glass_seal', Math.ceil(((doorWidth + height) * 2 / 2500) * numDoors),
      `ceil(((${doorWidth}+${height})*2/2500)*${numDoors})`);
  add('bolts', numDoors * 8,
      `${numDoors}*8`);
  add('handles', numHandles,
      `${numHandles}`);
  add('top_rail_rubber', Math.ceil((widthFull * numRails * 2) / 1000),
      `ceil((${widthFull}*${numRails}*2)/1000)`);
  add('door_brush_joint',
      Math.ceil(perDoorBrush * numDoors * height / 1000),
      `ceil(${perDoorBrush}*${numDoors}*${height}/1000)`);
  const railMult = widthFull <= 3000 ? 0.5 : (widthFull <= 6000 ? 1 : (widthFull <= 9000 ? 1.5 : 2));
  const capMult = widthFull <= 3000 ? 1 : (widthFull <= 6000 ? 2 : (widthFull <= 9000 ? 3 : 4));
  add('top_rails', railMult * numRails,
      `${railMult}*${numRails}`);
  add('side_rail_caps_45', railMult * numSideCaps,
      `${railMult}*${numSideCaps}`);
  add('bottom_double_caps', capMult * numBotDbl,
      `${capMult}*${numBotDbl}`);
  add('bottom_single_caps', capMult * numBotSngl,
      `${capMult}*${numBotSngl}`);
  add('rail_to_rail_connectors', Math.ceil(widthFull / 300 * numRRConn),
      `ceil(${widthFull}/300*${numRRConn})`);
  add('rail_to_cap_connectors', Math.ceil(widthFull / 300 * numRCConn),
      `ceil(${widthFull}/300*${numRCConn})`);
  add('metal_rail_aligner', Math.ceil(widthFull / 500 * numRails),
      `ceil(${widthFull}/500*${numRails})`);
  add('plastic_rail_aligner', Math.ceil(widthFull / 500 * numRails * 2),
      `ceil(${widthFull}/500*${numRails}*2)`);
  add('moving_mechanism_dovodchik', numMovDov,
      `${numMovDov}`);
  add('moving_mechanism_belt_connector', numMovBelt,
      `${numMovBelt}`);
  add('adapter_belt', (doorWidth - 12 <= 970 ? 1 : 2) * numAdapter,
      `(${doorWidth}-12<=970?1:2)*${numAdapter}`);
  add('bottom_rollers', numRollers,
      `${numRollers}`);
  add('corner_rubber_joint', Math.ceil(numRubCorner * 2 * height / 1000),
      `ceil(${numRubCorner}*2*${height}/1000)`);
  add('fixed_door_profile', (doorWidth - 12 <= 970 ? 1 : 2) * numFixProf,
      `(${doorWidth}-12<=970?1:2)*${numFixProf}`);
  add('fixed_mechanism', numFixMech,
      `${numFixMech}`);
  add('corner_magnet', 1,
      '1');

  const area = widthFull * height / 1000000;
  const glassPrice = (prices.glass && prices.glass[glass]) || 0;
  components.push({ name: 'glass', qty: area, price: glassPrice, sum: Math.round(area * glassPrice * 100) / 100, formula: `${widthFull}*${height}/1000000` });
  components.push({ name: 'installation', qty: area, price: prices.installation, sum: Math.round(area * prices.installation * 100) / 100, formula: `${widthFull}*${height}/1000000` });
  components.push({ name: 'logistics', qty: 1, price: prices.logistics, sum: prices.logistics, formula: '1' });

  switch (shotlan) {
    case '1шт по горизонтали': {
      const divider = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      add('divider_profile', divider,
          `(${doorWidth}-32<=995?1:2)*${numDoors}`);
      add('additional_glass_seal', divider * 2 * 1000 / 2500,
          `${divider}*2*1000/2500`);
      add('bolts_extra', numDoors * 8,
          `${numDoors}*8`);
      break; }
    case '1шт по вертикали': {
      const divider = (height <= 3000 ? 3 : 4) * numDoors;
      add('divider_profile', divider,
          `(${height}<=3000?3:4)*${numDoors}`);
      add('additional_glass_seal', divider * 2 * 1000 / 2500,
          `${divider}*2*1000/2500`);
      add('bolts_extra', numDoors * 8,
          `${numDoors}*8`);
      break; }
    case '2шт по горизонтали': {
      const divider = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors * 2;
      add('divider_profile', divider,
          `(${doorWidth}-32<=995?1:2)*${numDoors}*2`);
      add('additional_glass_seal', divider * 2 * 1000 / 2500,
          `${divider}*2*1000/2500`);
      add('bolts_extra', numDoors * 16,
          `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 1шт по горизонтали': {
      const vert = (height <= 3200 ? 3 : 4) * numDoors;
      const horiz = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      const divCnt = vert + horiz;
      add('divider_profile', divCnt,
          `${vert}+${horiz}`);
      add('additional_glass_seal', divCnt * 2 * 1000 / 2500,
          `${divCnt}*2*1000/2500`);
      add('bolts_extra', numDoors * 16,
          `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 2шт по горизонтали': {
      const vert = (height <= 3200 ? 3 : 4) * numDoors;
      const horiz = ((doorWidth - 32) <= 995 ? 1 : 2) * 2 * numDoors;
      const divCnt = vert + horiz;
      add('divider_profile', divCnt,
          `${vert}+${horiz}`);
      add('additional_glass_seal', divCnt * 2 * 1000 / 2500,
          `${divCnt}*2*1000/2500`);
      add('bolts_extra', numDoors * 24,
          `${numDoors}*24`);
      break; }
    case '1шт по вертикали и 3шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 3 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh,
          `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*3+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33),
          `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 4шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 4 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh,
          `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*4+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33),
          `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 5шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 5 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh,
          `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*5+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33),
          `ceil(${adh}/33)`);
      break; }
    case 'Очень много разделений': {
      const hBase = (doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3);
      const heightUnits = Math.ceil(height / 40);
      const adh = hBase * heightUnits * 2;
      add('adhesive_profile', adh,
          `${hBase}*${heightUnits}*2`);
      add('tape_33m', Math.ceil(adh / 33),
          `ceil(${adh}/33)`);
      break; }
  }
  let total = 0; components.forEach(c => { total += c.sum; });
  return { components, total, doorWidth };
}

function calculateEmbeddedComponents(widthFull, openWidth, height, subsystem, params, glass, shotlan) {
  const numDoors = params.num_doors || 1;
  let raw;
  switch (subsystem) {
    case '2+0': raw = (openWidth + 17.5 + 16) / numDoors; break;
    case '2+0|2+0': raw = (openWidth + 70 - 15 + 32) / numDoors; break;
    case '1WPUSH': raw = (openWidth - 6) / numDoors; break;
    case '2WPUSH': raw = (openWidth - 6 + 16) / numDoors; break;
    default: raw = openWidth / numDoors;
  }
  let doorWidth = Math.floor(raw);
  if (raw - doorWidth > 0.4) doorWidth += 1;

  const add = (name, qty, formula) => { if (qty > 0) { const p = prices[name] || 0; components.push({ name, qty, price: p, sum: Math.round(qty * p * 100) / 100, formula }); } };
  const components = [];
  add('vertical_profile', (height <= 3200 ? 1 : 2) * numDoors,
      `(${height}<=3200?1:2)*${numDoors}`);
  add('cap_no_brush', (height <= 3200 ? 0.5 : 1) * (params.profile_cap_no_brush || 0),
      `(${height}<=3200?0.5:1)*${params.profile_cap_no_brush || 0}`);
  add('cap_with_brush', (height <= 3200 ? 0.5 : 1) * (params.profile_cap_with_brush || 0),
      `(${height}<=3200?0.5:1)*${params.profile_cap_with_brush || 0}`);
  add('profile_C_cap', (height <= 3200 ? 0.5 : 1) * (params.profile_C_cap || 0),
      `(${height}<=3200?0.5:1)*${params.profile_C_cap || 0}`);
  add('profile_V_cap', (height <= 3200 ? 0.5 : 1) * (params.profile_V_cap || 0),
      `(${height}<=3200?0.5:1)*${params.profile_V_cap || 0}`);
  add('horizontal_profile', (doorWidth <= 1000 ? 1 : 2) * numDoors,
      `(${doorWidth}<=1000?1:2)*${numDoors}`);
  add('glass_seal', Math.ceil(((doorWidth + height) * 2 / 2500) * numDoors),
      `ceil(((${doorWidth}+${height})*2/2500)*${numDoors})`);
  add('bolts', numDoors * 8,
      `${numDoors}*8`);
  add('handles', params.num_handles || 0,
      `${params.num_handles || 0}`);
  add('top_rail_rubber', Math.ceil((widthFull * (params.num_rails || 0) * 2) / 1000),
      `ceil((${widthFull}*${params.num_rails || 0}*2)/1000)`);
  add('door_brush_joint',
      Math.ceil((params.door_brush || 0) * numDoors * height / 1000),
      `ceil((${params.door_brush || 0})*${numDoors}*${height}/1000)`);
  const railMult = widthFull <= 3000 ? 0.5 : (widthFull <= 6000 ? 1 : (widthFull <= 9000 ? 1.5 : 2));
  const capMult = widthFull <= 3000 ? 1 : (widthFull <= 6000 ? 2 : (widthFull <= 9000 ? 3 : 4));
  add('top_rails_41', railMult * (params.num_rails || 0), `${railMult}*${params.num_rails || 0}`);
  add('side_rail_caps_45', railMult * (params.num_side_caps || 0), `${railMult}*${params.num_side_caps || 0}`);
  add('bottom_double_caps', capMult * (params.num_bottom_double_caps || 0), `${capMult}*${params.num_bottom_double_caps || 0}`);
  add('bottom_single_caps', capMult * (params.num_bottom_single_caps || 0), `${capMult}*${params.num_bottom_single_caps || 0}`);
  add('rail_to_rail_connectors', Math.ceil(widthFull / 300 * (params.num_rail_to_rail_connectors || 0)), `ceil(${widthFull}/300*${params.num_rail_to_rail_connectors || 0})`);
  add('rail_to_cap_connectors', Math.ceil(widthFull / 300 * (params.num_rail_to_cap_connectors || 0)), `ceil(${widthFull}/300*${params.num_rail_to_cap_connectors || 0})`);
  add('metal_rail_aligner', Math.ceil(widthFull / 500 * (params.num_rails || 0)), `ceil(${widthFull}/500*${params.num_rails || 0})`);
  add('plastic_rail_aligner', Math.ceil(widthFull / 500 * (params.num_rails || 0) * 2), `ceil(${widthFull}/500*${params.num_rails || 0}*2)`);
  add('moving_mechanism_ci', params.moving_mechanism_ci || 0, `${params.moving_mechanism_ci || 0}`);
  add('belt_connector_mechanism', params.belt_connector_mechanism || 0, `${params.belt_connector_mechanism || 0}`);
  add('belt_adapter', (doorWidth - 12 <= 970 ? 1 : 2) * (params.belt_adapter || 0), `(${doorWidth}-12<=970?1:2)*${params.belt_adapter || 0}`);
  add('bottom_rollers', params.bottom_rollers || 0, `${params.bottom_rollers || 0}`);
  add('gap_rubber', (params.gap_rubber || 0) * 2 * height / 1000, `${params.gap_rubber || 0}*2*${height}/1000`);
  add('push_mechanism', params.push_mechanism || 0, `${params.push_mechanism || 0}`);
  add('gap_base_profile', params.gap_base_profile || 0, `${params.gap_base_profile || 0}`);
  add('gap_basic_cap_profile', params.gap_basic_cap_profile || 0, `${params.gap_basic_cap_profile || 0}`);
  add('gap_deco_cap_profile', params.gap_deco_cap_profile || 0, `${params.gap_deco_cap_profile || 0}`);
  add('inner_support_profile', params.inner_support_profile || 0, `${params.inner_support_profile || 0}`);
  add('corner_rubber_joint', Math.ceil(height * 2 / 1000 * (params.corner_rubber_joint || 0)), `ceil(${height}*2/1000*${params.corner_rubber_joint || 0})`);
  const area = openWidth * height / 1000000;
  const gp = (prices.glass && prices.glass[glass]) || 0;
  components.push({ name: 'glass', qty: area, price: gp, sum: Math.round(area * gp * 100) / 100, formula: `${openWidth}*${height}/1000000` });
  components.push({ name: 'installation', qty: area, price: prices.installation, sum: Math.round(area * prices.installation * 100) / 100, formula: `${openWidth}*${height}/1000000` });
  components.push({ name: 'logistics', qty: 1, price: prices.logistics, sum: prices.logistics, formula: '1' });

  // повторяем формулы шотланок
  switch (shotlan) {
    case '1шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '1шт по вертикали': {
      const d = (height <= 3000 ? 3 : 4) * numDoors;
      add('divider_profile', d, `(${height}<=3000?3:4)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '2шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors * 2;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}*2`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 1шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 2шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * 2 * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 24, `${numDoors}*24`);
      break; }
    case '1шт по вертикали и 3шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 3 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*3+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 4шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 4 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*4+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 5шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 5 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*5+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case 'Очень много разделений': {
      const hBase = (doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3);
      const heightUnits = Math.ceil(height / 40);
      const adh = hBase * heightUnits * 2;
      add('adhesive_profile', adh, `${hBase}*${heightUnits}*2`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
  }
  let total = 0; components.forEach(c => { total += c.sum; });
  return { components, total, doorWidth };
}

function calculateSyncComponents(widthFull, height, subsystem, params, glass, shotlan) {
  const numDoors = params.num_doors || 1;
  const numHandles = params.num_handles || 0;
  const numRails = params.num_rails || 0;
  const capNoBrush = params.profile_cap_no_brush || 0;
  const capWithBrush = params.profile_cap_with_brush || 0;
  const capC = params.profile_C_cap || 0;
  const capV = params.profile_V_cap || 0;
  const numSideCaps = params.num_side_caps || 0;
  const numBotDbl = params.num_bottom_double_caps || 0;
  const numBotSngl = params.num_bottom_single_caps || 0;
  const numRRConn = params.num_rail_to_rail_connectors || 0;
  const numRCConn = params.num_rail_to_cap_connectors || 0;
  const numBrush = params.door_brush || 0;
  const movMech = params.moving_mechanism || 0;
  const trosMech = params.moving_mechanism_tros || 0;
  const fixMech = params.fixed_mechanism || 0;
  const fixProf = params.fixed_door_profile || 0;
  const widthAdj = params.width_adjustment || 0;

  let raw = (widthFull + widthAdj - 15) / Math.max(1, numDoors);
  let doorWidth = Math.floor(raw);
  if (raw - doorWidth > 0.4) doorWidth += 1;

  const components = [];
  const add = (name, qty, formula) => { if (qty > 0) { const p = prices[name] || 0; components.push({ name, qty, price: p, sum: Math.round(qty * p * 100) / 100, formula }); } };

  add('vertical_profile', (height <= 3200 ? 1 : 2) * numDoors, `(${height}<=3200?1:2)*${numDoors}`);
  add('cap_no_brush', (height <= 3200 ? 0.5 : 1) * capNoBrush, `(${height}<=3200?0.5:1)*${capNoBrush}`);
  add('cap_with_brush', (height <= 3200 ? 0.5 : 1) * capWithBrush, `(${height}<=3200?0.5:1)*${capWithBrush}`);
  add('profile_C_cap', (height <= 3200 ? 0.5 : 1) * capC, `(${height}<=3200?0.5:1)*${capC}`);
  add('profile_V_cap', (height <= 3200 ? 0.5 : 1) * capV, `(${height}<=3200?0.5:1)*${capV}`);
  add('horizontal_profile', (doorWidth <= 1000 ? 1 : 2) * numDoors, `(${doorWidth}<=1000?1:2)*${numDoors}`);
  add('glass_seal', Math.ceil(((doorWidth + height) * 2 / 2500) * numDoors), `ceil(((${doorWidth}+${height})*2/2500)*${numDoors})`);
  add('bolts', numDoors * 8, `${numDoors}*8`);
  add('handles', numHandles, `${numHandles}`);
  add('top_rail_rubber', Math.ceil((widthFull * numRails * 2) / 1000), `ceil((${widthFull}*${numRails}*2)/1000)`);
  add('door_brush_joint', Math.ceil(numBrush * numDoors * height / 1000), `ceil(${numBrush}*${numDoors}*${height}/1000)`);
  const railMult = widthFull <= 3000 ? 0.5 : (widthFull <= 6000 ? 1 : 1.5);
  const capMult = widthFull <= 3000 ? 1 : (widthFull <= 6000 ? 2 : 3);
  add('top_rails_47', railMult * numRails, `${railMult}*${numRails}`);
  add('side_rail_caps_51', railMult * numSideCaps, `${railMult}*${numSideCaps}`);
  add('bottom_double_caps', capMult * numBotDbl, `${capMult}*${numBotDbl}`);
  add('bottom_single_caps', capMult * numBotSngl, `${capMult}*${numBotSngl}`);
  add('rail_to_rail_connectors', Math.ceil(widthFull / 300 * numRRConn), `ceil(${widthFull}/300*${numRRConn})`);
  add('rail_to_cap_connectors', Math.ceil(widthFull / 300 * numRCConn), `ceil(${widthFull}/300*${numRCConn})`);
  add('metal_rail_aligner', Math.ceil(widthFull / 500 * numRails), `ceil(${widthFull}/500*${numRails})`);
  add('plastic_rail_aligner', Math.ceil(widthFull / 500 * numRails * 2), `ceil(${widthFull}/500*${numRails}*2)`);
  add('moving_mechanism_ci', movMech, `${movMech}`);
  add('moving_mechanism_ct', trosMech, `${trosMech}`);
  add('fixed_mechanism', fixMech, `${fixMech}`);
  add('corner_rubber_joint', Math.ceil(height * 2 / 1000), `ceil(${height}*2/1000)`);
  add('fixed_door_profile', (doorWidth - 12 <= 970 ? 1 : 2) * fixProf, `(${doorWidth}-12<=970?1:2)*${fixProf}`);

  const area = widthFull * height / 1000000;
  const gp = (prices.glass && prices.glass[glass]) || 0;
  components.push({ name: 'glass', qty: area, price: gp, sum: Math.round(area * gp * 100) / 100, formula: `${widthFull}*${height}/1000000` });
  components.push({ name: 'installation', qty: area, price: prices.installation, sum: Math.round(area * prices.installation * 100) / 100, formula: `${widthFull}*${height}/1000000` });
  components.push({ name: 'logistics', qty: 1, price: prices.logistics, sum: prices.logistics, formula: '1' });

  // шотланки
  switch (shotlan) {
    case '1шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '1шт по вертикали': {
      const d = (height <= 3000 ? 3 : 4) * numDoors;
      add('divider_profile', d, `(${height}<=3000?3:4)*${numDoors}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 8, `${numDoors}*8`);
      break; }
    case '2шт по горизонтали': {
      const d = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors * 2;
      add('divider_profile', d, `(${doorWidth}-32<=995?1:2)*${numDoors}*2`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 1шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 16, `${numDoors}*16`);
      break; }
    case '1шт по вертикали и 2шт по горизонтали': {
      const v = (height <= 3200 ? 3 : 4) * numDoors;
      const h = ((doorWidth - 32) <= 995 ? 1 : 2) * 2 * numDoors;
      const d = v + h;
      add('divider_profile', d, `${v}+${h}`);
      add('additional_glass_seal', d * 2 * 1000 / 2500, `${d}*2*1000/2500`);
      add('bolts_extra', numDoors * 24, `${numDoors}*24`);
      break; }
    case '1шт по вертикали и 3шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 3 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*3+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 4шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 4 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*4+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case '1шт по вертикали и 5шт по горизонтали': {
      let adh = ((doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3)) * 5 + (height <= 3000 ? 3 : 4);
      adh = adh * 2 * numDoors;
      add('adhesive_profile', adh, `(((${doorWidth}-32)<=995?1:((${doorWidth}-32)<=1995?2:3))*5+(${height}<=3000?3:4))*2*${numDoors}`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
    case 'Очень много разделений': {
      const hBase = (doorWidth - 32) <= 995 ? 1 : ((doorWidth - 32) <= 1995 ? 2 : 3);
      const heightUnits = Math.ceil(height / 40);
      const adh = hBase * heightUnits * 2;
      add('adhesive_profile', adh, `${hBase}*${heightUnits}*2`);
      add('tape_33m', Math.ceil(adh / 33), `ceil(${adh}/33)`);
      break; }
  }
  let total = 0; components.forEach(c => { total += c.sum; });
  return { components, total, doorWidth };
}

// --- другие расчётные функции опущены для краткости (partition, wall-mounted, angle, sync, embedded) ---

function calculateTotal() {
  const widthFull = Number(selected.fullWidth);
  const openWidth = selected.openWidth ? Number(selected.openWidth) : widthFull;
  const height = Number(selected.height);
  const params = { num_doors: 1 };
  let res;
  switch (systemType) {
    case 'partition':
      res = calculatePartitionComponents(widthFull, height, selected.subsystem, params, selected.glass, selected.shotlan);
      break;
    case 'wall-mounted':
      res = calculateWallMountedComponents(widthFull, openWidth, height, selected.subsystem, params, selected.glass, selected.shotlan);
      break;
    case 'angle':
      res = calculateAngleComponents(widthFull, height, selected.subsystem, params, selected.glass, selected.shotlan);
      break;
    case 'sync':
      res = calculateSyncComponents(widthFull, height, selected.subsystem, params, selected.glass, selected.shotlan);
      break;
    case 'embedded-wall':
      res = calculateEmbeddedComponents(widthFull, openWidth, height, selected.subsystem, params, selected.glass, selected.shotlan);
      break;
    default:
      res = calculateComponents(widthFull, height, selected.subsystem, params, selected.glass, selected.shotlan);
  }
  lastCalculation = res;
  return res.total;
}

init();
