// Получаем параметры из url
const urlParams = new URLSearchParams(window.location.search);
const systemType = urlParams.get('type');

// Элементы страницы
const backBtn = document.getElementById('back-button');
const stepsBar = document.getElementById('steps-bar');
const container = document.getElementById('calc-container');
const resultTable = document.getElementById('result-table');

// Выбранные пользователем параметры
let selected = {
    systemName: '',
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
// Экранные шаги калькулятора
const steps = [
    {name: 'params', render: renderParams},
    {name: 'design', render: renderDesign},
    {name: 'calc', render: renderCalcButton}
];

// Шаги в хедере
const stepItems = [
    {key: 'system', title: 'Тип системы'},
    {key: 'subsystem', title: 'Подсистема'},
    {key: 'glass', title: 'Стекло'},
    {key: 'shotlan', title: 'Шотланки'}
];

function init() {
    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    selected.systemName = systemsData[systemType]?.name || '';
    renderStepsBar();
    showStep(0);
}

function renderStepsBar() {
    stepsBar.innerHTML = '';
    stepItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'step';
        div.dataset.key = item.key;
        div.innerHTML = `<span class="step-name">${item.title}</span><span class="step-value"></span>`;
        if (item.key === 'system') {
            div.addEventListener('click', () => { window.location.href = 'index.html'; });
        } else if (item.key === 'subsystem') {
            div.addEventListener('click', () => { showStep(0); });
        } else {
            div.addEventListener('click', () => { showStep(1); });
        }
        stepsBar.appendChild(div);
    });
    updateStepsBar();
}

function updateStepsBar() {
    const values = {
        system: selected.systemName,
        subsystem: selected.subsystem || '',
        glass: selected.glass || '',
        shotlan: selected.shotlan || ''
    };
    [...stepsBar.children].forEach(step => {
        const key = step.dataset.key;
        const span = step.querySelector('.step-value');
        if (span) span.textContent = values[key];
        step.classList.toggle('completed', !!values[key]);
    });
}

function setActiveStep(index) {
    const key = index === 0 ? 'subsystem' : index === 1 ? 'glass' : 'shotlan';
    [...stepsBar.children].forEach(el => {
        el.classList.toggle('active', el.dataset.key === key);
    });
}

function showStep(index) {
    container.innerHTML = '';
    setActiveStep(index);
    steps[index].render(index);
    updateStepsBar();
}

// ----- Рендеры шагов -----
function renderParams(stepIndex) {
    const system = systemsData[systemType];
    const titleChar = document.createElement('h2');
    titleChar.className = 'section-title';
    titleChar.textContent = 'Выберите характеристики';
    const wFull = document.createElement('input');
    wFull.type = 'range';
    wFull.min = system.minWidth || 500;
    wFull.max = system.maxWidth || 6000;
    wFull.value = wFull.min;
    wFull.className = 'range-input';
    const wFullVal = document.createElement('span');
    wFullVal.className = 'range-value';
    wFullVal.textContent = wFull.value;
    const wFullNum = document.createElement('input');
    wFullNum.type = 'number';
    wFullNum.className = 'number-input';
    wFullNum.min = wFull.min;
    wFullNum.max = wFull.max;
    wFullNum.value = wFull.value;
    const wFullHelp = document.createElement('span');
    wFullHelp.className = 'help-icon';
    wFullHelp.textContent = '?';
    const wFullImg = document.createElement('img');
    wFullImg.src = images.tooltips[systemType].width;
    wFullImg.className = 'tooltip-img';
    wFullHelp.appendChild(wFullImg);
    const sizeBar1 = document.createElement('div');
    sizeBar1.className = 'size-bar';
    const header1 = document.createElement('div');
    header1.className = 'size-bar-header';
    const wFullLabel = document.createElement('span');
    wFullLabel.className = 'range-label';
    wFullLabel.textContent = 'Полная ширина:';
    header1.append(wFullLabel, wFullNum, wFullHelp);
    const wrap1 = document.createElement('div');
    wrap1.className = 'range-wrapper';
    wrap1.append(wFull, wFullVal);
    sizeBar1.append(header1, wrap1);
    wFull.addEventListener('input', () => {
        wFullVal.textContent = wFull.value;
        wFullNum.value = wFull.value;
        updateSubs();
    });
    const applyFullInput = () => {
        let val = Number(wFullNum.value);
        if (isNaN(val)) return;
        val = Math.min(Math.max(val, wFull.min), wFull.max);
        wFull.value = val;
        wFullVal.textContent = val;
        updateSubs();
    };
    wFullNum.addEventListener('blur', applyFullInput);
    wFullNum.addEventListener('keydown', e => { if (e.key === 'Enter') { applyFullInput(); wFullNum.blur(); } });

    let wOpen;
    let sizeBar2;
    if (system.extraField) {
        wOpen = document.createElement('input');
        wOpen.type = 'range';
        wOpen.min = system.minWidth || 500;
        wOpen.max = system.maxWidth || 6000;
        wOpen.value = wOpen.min;
        wOpen.className = 'range-input';
        const wOpenVal = document.createElement('span');
        wOpenVal.className = 'range-value';
        wOpenVal.textContent = wOpen.value;
        const wOpenNum = document.createElement('input');
        wOpenNum.type = 'number';
        wOpenNum.className = 'number-input';
        wOpenNum.min = wOpen.min;
        wOpenNum.max = wOpen.max;
        wOpenNum.value = wOpen.value;
        const wOpenHelp = document.createElement('span');
        wOpenHelp.className = 'help-icon';
        wOpenHelp.textContent = '?';
        const wOpenImg = document.createElement('img');
        wOpenImg.src = images.tooltips[systemType].open;
        wOpenImg.className = 'tooltip-img';
        wOpenHelp.appendChild(wOpenImg);
        sizeBar2 = document.createElement('div');
        sizeBar2.className = 'size-bar';
        const header2 = document.createElement('div');
        header2.className = 'size-bar-header';
        const wOpenLabel = document.createElement('span');
        wOpenLabel.className = 'range-label';
        wOpenLabel.textContent = 'Ширина открытой части:';
        header2.append(wOpenLabel, wOpenNum, wOpenHelp);
        const wrap2 = document.createElement('div');
        wrap2.className = 'range-wrapper';
        wrap2.append(wOpen, wOpenVal);
        sizeBar2.append(header2, wrap2);
        wOpen.addEventListener('input', () => {
            wOpenVal.textContent = wOpen.value;
            wOpenNum.value = wOpen.value;
            updateSubs();
        });
        const applyOpenInput = () => {
            let val = Number(wOpenNum.value);
            if (isNaN(val)) return;
            val = Math.min(Math.max(val, wOpen.min), wOpen.max);
            wOpen.value = val;
            wOpenVal.textContent = val;
            updateSubs();
        };
        wOpenNum.addEventListener('blur', applyOpenInput);
        wOpenNum.addEventListener('keydown', e => { if (e.key === 'Enter') { applyOpenInput(); wOpenNum.blur(); } });
    }

    const h = document.createElement('input');
    h.type = 'range';
    h.min = 1800;
    h.max = 3500;
    h.value = 2000;
    h.className = 'range-input';
    const hVal = document.createElement('span');
    hVal.className = 'range-value';
    hVal.textContent = h.value;
    const hNum = document.createElement('input');
    hNum.type = 'number';
    hNum.className = 'number-input';
    hNum.min = h.min;
    hNum.max = h.max;
    hNum.value = h.value;
    const hHelp = document.createElement('span');
    hHelp.className = 'help-icon';
    hHelp.textContent = '?';
    const hImg = document.createElement('img');
    hImg.src = images.tooltips[systemType].height;
    hImg.className = 'tooltip-img';
    hHelp.appendChild(hImg);
    const sizeBar3 = document.createElement('div');
    sizeBar3.className = 'size-bar';
    const header3 = document.createElement('div');
    header3.className = 'size-bar-header';
    const hLabel = document.createElement('span');
    hLabel.className = 'range-label';
    hLabel.textContent = 'Высота:';
    header3.append(hLabel, hNum, hHelp);
    const wrap3 = document.createElement('div');
    wrap3.className = 'range-wrapper';
    wrap3.append(h, hVal);
    sizeBar3.append(header3, wrap3);
    h.addEventListener('input', () => {
        hVal.textContent = h.value;
        hNum.value = h.value;
    });
    const applyHInput = () => {
        let val = Number(hNum.value);
        if (isNaN(val)) return;
        val = Math.min(Math.max(val, h.min), h.max);
        h.value = val;
        hVal.textContent = val;
    };
    hNum.addEventListener('blur', applyHInput);
    hNum.addEventListener('keydown', e => { if (e.key === 'Enter') { applyHInput(); hNum.blur(); } });

    const subsTitle = document.createElement('h2');
    subsTitle.className = 'section-title';
    subsTitle.textContent = 'Выберите подсистему';

    const subsContainer = document.createElement('div');
    subsContainer.className = 'systems-container';
    let activeBlock = null;

    const updateSubs = () => {
        const widthVal = system.extraField ? Number(wOpen?.value) : Number(wFull.value);
        const keys = Object.keys(system.subsystems || {});
        const subsArr = keys.filter(k => {
            const lim = system.subsystems[k];
            return widthVal >= lim.min && widthVal <= lim.max;
        });
        subsContainer.innerHTML = '';
        activeBlock = null;
        subsArr.forEach(name => {
            const block = document.createElement('div');
            block.className = 'system-block subsystem-block';
            block.innerHTML = `
                <img src="${images.subsystems_posters[systemType][name]}" alt="${name}">
                <video muted loop preload="none" src="${images.subsystems[systemType][name]}"></video>
                <span class="system-title">${name}</span>`;
            block.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) {
                    const v = block.querySelector('video');
                    v.style.display = 'block';
                    v.play();
                }
            });
            block.addEventListener('mouseleave', () => {
                const v = block.querySelector('video');
                v.pause();
                v.style.display = 'none';
            });
            block.addEventListener('click', () => {
                selected.subsystem = name;
                if (activeBlock) activeBlock.classList.remove('selected');
                block.classList.add('selected');
                activeBlock = block;
                updateStepsBar();
            });
            subsContainer.appendChild(block);
        });
        if (subsArr.length === 1 && subsContainer.firstChild) {
            subsContainer.firstChild.click();
        } else {
            selected.subsystem = null;
        }
    };

    updateSubs();

    const btn = document.createElement('button');
    btn.textContent = 'Далее';
    btn.className = 'next-btn';
    btn.className = 'next-btn';
    btn.addEventListener('click', () => {
        selected.fullWidth = wFull.value;
        if (system.extraField) selected.openWidth = wOpen.value;
        selected.height = h.value;
        if (selected.fullWidth && selected.height && (!system.extraField || selected.openWidth) && selected.subsystem) {
            showStep(stepIndex + 1);
        }
    });

    container.append(titleChar);
    if (system.extraField) {
        container.append(sizeBar2, sizeBar1);
    } else {
        container.append(sizeBar1);
    }
    container.append(sizeBar3, subsTitle, subsContainer, btn);
}

function renderDesign(stepIndex) {
    const glassTitle = document.createElement('h2');
    glassTitle.className = 'section-title';
    glassTitle.textContent = 'Выберите стекло';
    const glassContainer = document.createElement('div');
    glassContainer.className = 'options-container';

    const shotlanTitle = document.createElement('h2');
    shotlanTitle.className = 'section-title';
    shotlanTitle.textContent = 'Выберите шотланки';
    const shotlanContainer = document.createElement('div');
    shotlanContainer.className = 'options-container';

    let activeGlass = null;
    let activeShot = null;

    const renderGlass = () => {
        glassContainer.innerHTML = '';
        Object.keys(images.glass).forEach(name => {
            const block = document.createElement('div');
            block.className = 'option-block';
            block.innerHTML = `<img src="${images.glass[name]}" alt="${name}"><span class="system-title">${name}</span>`;
            block.addEventListener('click', () => {
                selected.glass = name;
                if (activeGlass) activeGlass.classList.remove('selected');
                block.classList.add('selected');
                activeGlass = block;
                updateShotlans();
                updateStepsBar();
            });
            glassContainer.appendChild(block);
        });
    };

    const updateShotlans = () => {
        let options = Object.keys(images.shotlan);
        if (selected.glass === 'Рифленое') {
            options = options.filter(o => !hideWithRiffled.includes(o));
        }
        shotlanContainer.innerHTML = '';
        activeShot = null;
        options.forEach(name => {
            const block = document.createElement('div');
            block.className = 'option-block';
            block.innerHTML = `<img src="${images.shotlan[name]}" alt="${name}"><span class="system-title">${name}</span>`;
            block.addEventListener('click', () => {
                selected.shotlan = name;
                if (activeShot) activeShot.classList.remove('selected');
                block.classList.add('selected');
                activeShot = block;
                updateStepsBar();
            });
            shotlanContainer.appendChild(block);
        });
    };

    renderGlass();
    updateShotlans();

    const btn = document.createElement('button');
    btn.textContent = 'Далее';
    btn.className = 'next-btn';
    btn.addEventListener('click', () => {
        if (selected.glass && selected.shotlan) {
            showStep(stepIndex + 1);
        }
    });

    container.append(glassTitle, glassContainer, shotlanTitle, shotlanContainer, btn);
}

function renderCalcButton() {
    const btn = document.createElement('button');
    btn.textContent = 'Рассчитать';
    btn.addEventListener('click', () => {
        renderResult();
    });
    container.appendChild(btn);
}

function renderResult() {
    resultTable.classList.remove('hidden');
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
