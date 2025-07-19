// Получаем параметры из url
const urlParams = new URLSearchParams(window.location.search);
const systemType = urlParams.get('type');

// Элементы страницы
const stepsBar = document.getElementById('steps-bar');
const container = document.getElementById('calc-container');
const resultTable = document.getElementById('result-table');
const viewer = document.getElementById('viewer');
const viewerContent = viewer.querySelector('.modal-content');
function showMedia(type, src) {
    viewerContent.innerHTML = type === 'video'
        ? `<video src="${src}" controls autoplay style="max-width:90vw;max-height:90vh"></video>`
        : `<img src="${src}" style="max-width:90vw;max-height:90vh">`;
    viewer.classList.remove('hidden');
}
viewer.addEventListener('click', e => {
    if (e.target === viewer) {
        viewer.classList.add('hidden');
        viewerContent.innerHTML = '';
    }
});

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

// Возвращает стартовые размеры для каждой системы
function getDefaultSizes(type) {
    switch (type) {
        case 'angle':
        case 'sync':
        case 'cascade':
            return { fullWidth: 2800, openWidth: 0, height: 2800 };
        case 'partition':
            return { fullWidth: 4000, openWidth: 0, height: 2800 };
        case 'embedded-wall':
        case 'wall-mounted':
            return { fullWidth: 2000, openWidth: 1000, height: 2800 };
        case 'unlinked':
            return { fullWidth: 2000, openWidth: 0, height: 2800 };
        default:
            return { fullWidth: 2800, openWidth: 0, height: 2800 };
    }
}


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
    const defaults = getDefaultSizes(systemType);
    const titleChar = document.createElement('h2');
    titleChar.className = 'section-title';
    titleChar.textContent = 'Выберите характеристики';
    const wFull = document.createElement('input');
    wFull.type = 'range';
    wFull.min = system.minWidth || 500;
    wFull.max = system.maxWidth || 6000;
    wFull.value = Math.min(Math.max(defaults.fullWidth || wFull.min, wFull.min), wFull.max);
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
    wFullHelp.addEventListener('mouseenter', () => {
        wFullImg.style.display = 'block';
    });
    const hideFull = () => { wFullImg.style.display = 'none'; };
    wFullHelp.addEventListener('mouseleave', hideFull);
    wFullImg.addEventListener('mouseenter', hideFull);
    const sizeBar1 = document.createElement('div');
    sizeBar1.className = 'size-bar';
    const header1 = document.createElement('div');
    header1.className = 'size-bar-header';
    const wFullLabel = document.createElement('span');
    wFullLabel.className = 'range-label';
    wFullLabel.textContent = 'Полная ширина проема:';
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
        wOpen.value = Math.min(Math.max(defaults.openWidth || wOpen.min, wOpen.min), wOpen.max);
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
        wOpenHelp.addEventListener('mouseenter', () => {
            wOpenImg.style.display = 'block';
        });
        const hideOpen = () => { wOpenImg.style.display = 'none'; };
        wOpenHelp.addEventListener('mouseleave', hideOpen);
        wOpenImg.addEventListener('mouseenter', hideOpen);
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
    h.value = Math.min(Math.max(defaults.height || h.min, h.min), h.max);
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
    hHelp.addEventListener('mouseenter', () => {
        hImg.style.display = 'block';
    });
    const hideHeight = () => { hImg.style.display = 'none'; };
    hHelp.addEventListener('mouseleave', hideHeight);
    hImg.addEventListener('mouseenter', hideHeight);
    const sizeBar3 = document.createElement('div');
    sizeBar3.className = 'size-bar';
    const header3 = document.createElement('div');
    header3.className = 'size-bar-header';
    const hLabel = document.createElement('span');
    hLabel.className = 'range-label';
    hLabel.textContent = 'Высота проема:';
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
        selected.subsystem = null;
        updateNextState();
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
            block.addEventListener('dblclick', () => {
                showMedia('video', images.subsystems[systemType][name]);
            });
            block.addEventListener('click', () => {
                selected.subsystem = name;
                if (activeBlock) activeBlock.classList.remove('selected');
                block.classList.add('selected');
                activeBlock = block;
                updateStepsBar();
                updateNextState();
            });
            subsContainer.appendChild(block);
        });
        updateStepsBar();
    };

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Далее';
    nextBtn.className = 'next-btn';
    nextBtn.disabled = true;
    const hint = document.createElement('span');
    hint.className = 'hint';
    hint.textContent = 'Выберите подсистему';
    const updateNextState = () => {
        const ok = !!selected.subsystem;
        nextBtn.disabled = !ok;
        hint.style.display = ok ? 'none' : 'inline';
    };
    nextBtn.addEventListener('click', () => {
        selected.fullWidth = wFull.value;
        if (system.extraField) selected.openWidth = wOpen.value;
        selected.height = h.value;
        if (selected.fullWidth && selected.height && (!system.extraField || selected.openWidth) && selected.subsystem) {
            showStep(stepIndex + 1);
        }
    });

    const backBtn = document.createElement('button');
    backBtn.textContent = 'Вернуться назад';
    backBtn.className = 'back-btn';
    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    const btnRow = document.createElement('div');
    btnRow.className = 'button-row';
    btnRow.append(backBtn, nextBtn, hint);

    updateNextState();

    updateSubs();

    container.append(titleChar);
    if (system.extraField) {
        container.append(sizeBar2, sizeBar1);
    } else {
        container.append(sizeBar1);
    }
    container.append(sizeBar3, subsTitle, subsContainer, btnRow);
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
            block.className = 'option-block glass-option';
            block.innerHTML = `<img src="${images.glass[name]}" alt="${name}"><span class="system-title">${name}</span>`;
            block.addEventListener('click', () => {
                selected.glass = name;
                if (activeGlass) activeGlass.classList.remove('selected');
                block.classList.add('selected');
                activeGlass = block;
                updateShotlans();
                updateStepsBar();
            });
            block.addEventListener('dblclick', () => {
                showMedia('image', images.glass[name]);
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
            block.className = 'option-block shotlan-option';
            block.innerHTML = `<img src="${images.shotlan[name]}" alt="${name}"><span class="system-title">${name}</span>`;
            block.addEventListener('click', () => {
                selected.shotlan = name;
                if (activeShot) activeShot.classList.remove('selected');
                block.classList.add('selected');
                activeShot = block;
                updateStepsBar();
            });
            block.addEventListener('dblclick', () => {
                showMedia('image', images.shotlan[name]);
            });
            shotlanContainer.appendChild(block);
        });
    };

    renderGlass();
    updateShotlans();

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Рассчитать';
    nextBtn.className = 'next-btn';
    nextBtn.addEventListener('click', () => {
        if (selected.glass && selected.shotlan) {
            renderResult();
        }
    });

    const backBtn = document.createElement('button');
    backBtn.textContent = 'Вернуться назад';
    backBtn.className = 'back-btn';
    backBtn.style.marginRight = '2rem';
    backBtn.addEventListener('click', () => {
        showStep(stepIndex - 1);
    });

    container.append(glassTitle, glassContainer, shotlanTitle, shotlanContainer, backBtn, nextBtn);
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
