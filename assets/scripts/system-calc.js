// Получаем параметры из url
const urlParams = new URLSearchParams(window.location.search);
const systemType = urlParams.get('type');

// Элементы страницы
const stepsBar = document.getElementById('steps-bar');
const container = document.getElementById('calc-container');
const resultTable = document.getElementById('result-table');
const viewer = document.getElementById('viewer');
const viewerContent = viewer.querySelector('.modal-content');
const calcModal = document.getElementById('calc-modal');
const calcContent = calcModal.querySelector('.modal-content');
const isMobile = window.innerWidth <= 600;
function showMedia(type, src) {
    viewerContent.innerHTML = type === 'video'
        ? `<video src="${src}" controls autoplay muted playsinline style="max-width:90vw;max-height:90vh"></video>`
        : `<img src="${src}" style="max-width:90vw;max-height:90vh">`;
    viewer.classList.remove('hidden');
}
viewer.addEventListener('click', e => {
    if (e.target === viewer) {
        viewer.classList.add('hidden');
        viewerContent.innerHTML = '';
    }
});

calcModal.addEventListener('click', e => {
    if (e.target === calcModal) {
        calcModal.classList.add('hidden');
        calcContent.innerHTML = '';
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
    {name: 'design', render: renderDesign}
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
    window.scrollTo(0, 0);
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
    wFullHelp.addEventListener('click', () => {
        showMedia('image', images.tooltips[systemType].width);
    });
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
        wOpenHelp.addEventListener('click', () => {
            showMedia('image', images.tooltips[systemType].open);
        });
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
    hHelp.addEventListener('click', () => {
        showMedia('image', images.tooltips[systemType].height);
    });
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
                <video muted loop preload="none" playsinline src="${images.subsystems[systemType][name]}"></video>
                <span class="system-title">${name}</span>`;
            block.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) {
                    const v = block.querySelector('video');
                    v.style.display = 'block';
                    v.load();
                    v.currentTime = 0;
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
                if (isMobile) {
                    const vid = block.querySelector('video');
                    if (activeBlock && activeBlock !== block) {
                        const prev = activeBlock.querySelector('video');
                        prev.pause();
                        prev.style.display = 'none';
                    }
                    vid.style.display = 'block';
                    vid.load();
                    vid.currentTime = 0;
                    vid.play();
                }
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
            const imgSrc = isMobile && images.glass_mobile[name] ? images.glass_mobile[name] : images.glass[name];
            const block = document.createElement('div');
            block.className = 'option-block glass-option';
            block.innerHTML = `<img src="${imgSrc}" alt="${name}"><span class="system-title">${name}</span>`;
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
        selected.shotlan = null;
        shotlanContainer.innerHTML = '';
        activeShot = null;
        options.forEach(name => {
            const imgSrc = isMobile && images.shotlan_mobile[name] ? images.shotlan_mobile[name] : images.shotlan[name];
            const block = document.createElement('div');
            block.className = 'option-block shotlan-option';
            block.innerHTML = `<img src="${imgSrc}" alt="${name}"><span class="system-title">${name}</span>`;
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
            openCalcModal();
        }
    });

    const backBtn = document.createElement('button');
    backBtn.textContent = 'Вернуться назад';
    backBtn.className = 'back-btn';
    backBtn.addEventListener('click', () => {
        showStep(stepIndex - 1);
    });

    const btnRow = document.createElement('div');
    btnRow.className = 'button-row';
    btnRow.append(backBtn, nextBtn);

    container.append(glassTitle, glassContainer, shotlanTitle, shotlanContainer, btnRow);
}

function openCalcModal() {
    calcContent.innerHTML = `
        <form id="calc-form" class="calc-form">
            <label>Имя<input type="text" id="user-name" required></label>
            <label>Телефон<input type="tel" id="user-phone" pattern="\\+998\\s\\d{2}\\s\\d{3}\\s\\d{2}\\s\\d{2}" title="+998 99 999 99 99" required></label>
            <label class="checkbox-label"><input type="checkbox" id="save-user"> Запомнить меня</label>
            <div class="modal-buttons">
                <button type="button" class="calc-submit next-btn">Рассчитать</button>
                <button type="button" class="cancel-btn">Отмена</button>
            </div>
        </form>`;
    const nameInput = document.getElementById('user-name');
    const phoneInput = document.getElementById('user-phone');
    const formatPhone = () => {
        let digits = phoneInput.value.replace(/\D/g, '');
        if (!digits.startsWith('998')) digits = '998' + digits;
        digits = digits.slice(0, 12);
        let res = '+998';
        if (digits.length > 3) res += ' ' + digits.slice(3,5);
        if (digits.length > 5) res += ' ' + digits.slice(5,8);
        if (digits.length > 8) res += ' ' + digits.slice(8,10);
        if (digits.length > 10) res += ' ' + digits.slice(10,12);
        phoneInput.value = res.trim();
    };
    const saveCb = document.getElementById('save-user');
    nameInput.value = localStorage.getItem('calcName') || '';
    phoneInput.value = localStorage.getItem('calcPhone') || '+998 ';
    formatPhone();
    phoneInput.addEventListener('input', formatPhone);
    calcModal.classList.remove('hidden');
    calcContent.querySelector('.cancel-btn').addEventListener('click', () => {
        calcModal.classList.add('hidden');
        calcContent.innerHTML = '';
    });
    calcContent.querySelector('.calc-submit').addEventListener('click', () => {
        const form = document.getElementById('calc-form');
        if (!form.checkValidity()) { form.reportValidity(); return; }
        if (saveCb.checked) {
            localStorage.setItem('calcName', nameInput.value);
            localStorage.setItem('calcPhone', phoneInput.value);
        }
        const tableHtml = buildResultTable();
        calcContent.innerHTML = `<div class="table-scroll">${tableHtml}</div><div class="modal-buttons"><button type="button" class="download-btn next-btn">Скачать</button><button type="button" class="cancel-btn">Закрыть</button></div>`;
        const tableWrapper = calcContent.querySelector('.table-scroll');
        const downloadBtn = calcContent.querySelector('.download-btn');
        downloadBtn.addEventListener('click', () => {
            if (!tableWrapper) return;
            const style = `.calc-table{width:100%;border-collapse:collapse;margin:0;text-align:left;}\n` +
                `.calc-table th,.calc-table td{border:1px solid #ccc;padding:0.25rem 0.5rem;}\n` +
                `.calc-table .indent td:first-child{padding-left:0;}\n` +
                `.calc-table .section-header td{padding-top:0;font-weight:bold;}\n` +
                `.calc-table .summary td{font-weight:bold;border-top:2px solid #ccc;}`;
            const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${style}</style></head><body>${tableWrapper.innerHTML}</body></html>`;
            const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'calculation.doc';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
        calcContent.querySelector('.cancel-btn').addEventListener('click', () => {
            calcModal.classList.add('hidden');
            calcContent.innerHTML = '';
        });
    });
}

function renderCalcButton() {
    const btn = document.createElement('button');
    btn.textContent = 'Рассчитать';
    btn.addEventListener('click', () => {
        renderResult();
    });
    container.appendChild(btn);
}

function buildResultTable() {
    const total = Math.ceil(calculateTotal());
    const shotlanNames = ['divider_profile','additional_glass_seal','bolts_extra','adhesive_profile','tape_33m'];
    const lastNames = ['installation','logistics','glass'];
    const base = [], shot = [], last = [];
    lastCalculation.components.forEach(c => {
        if (shotlanNames.includes(c.name)) shot.push(c);
        else if (lastNames.includes(c.name)) last.push(c);
        else base.push(c);
    });

    const row = (comp, indent=false) => {
        const name = componentNames[comp.name] || comp.name;
        const cls = indent ? ' class="indent"' : '';
        return `<tr${cls}><td>${name}</td><td>${comp.qty}</td><td>${comp.price}</td><td>${comp.sum}</td></tr>`;
    };

    let html = '<table class="calc-table">';
    html += '<tr><th>Компонент</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr>';
    html += '<tr class="section-header"><td colspan="4">Компоненты</td></tr>';
    base.forEach(c => { html += row(c, true); });
    if (shot.length) {
        html += '<tr class="section-header"><td colspan="4">Шотланки</td></tr>';
        shot.forEach(c => { html += row(c, true); });
    }
    if (last.length) {
        html += '<tr class="section-header"><td colspan="4">Остальные расходы</td></tr>';
        last.forEach(c => { html += row(c, true); });
    }
    html += `<tr class="summary"><td colspan="3">Ширина двери</td><td>${lastCalculation.doorWidth} мм</td></tr>`;
    html += `<tr class="summary"><td colspan="3">Итоговая стоимость</td><td>${total} у.е.</td></tr>`;
    html += '</table>';
    html += '<div class="currency-note">Оплата производиться по курсу цб в день оформления заказа</div>';
    return html;
}


function calculateTotal() {
  const widthFull = Number(selected.fullWidth);
  const openWidth = selected.openWidth ? Number(selected.openWidth) : widthFull;
  const height = Number(selected.height);
  const params = systemsData[systemType]?.subsystems[selected.subsystem]?.params || { num_doors: 1 };
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

// Маска телефона в футере
const footerPhone = document.querySelector('#feedback-form input[type="tel"]');
if (footerPhone) {
    const formatFooterPhone = () => {
        let digits = footerPhone.value.replace(/\D/g, '');
        if (!digits.startsWith('998')) digits = '998' + digits;
        digits = digits.slice(0, 12);
        let res = '+998';
        if (digits.length > 3) res += ' ' + digits.slice(3,5);
        if (digits.length > 5) res += ' ' + digits.slice(5,8);
        if (digits.length > 8) res += ' ' + digits.slice(8,10);
        if (digits.length > 10) res += ' ' + digits.slice(10,12);
        footerPhone.value = res.trim();
    };
    footerPhone.value = '+998 ';
    formatFooterPhone();
    footerPhone.addEventListener('input', formatFooterPhone);
}
