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

let selected = {
    subsystem: null,
    glass: null,
    shotlan: null,
    width: '',
    height: ''
};

// Шаги расчёта
const steps = [
    {name: 'Подсистема', render: renderSubsystem},
    {name: 'Стекло', render: renderGlass},
    {name: 'Шотланки', render: renderShotlan},
    {name: 'Размеры', render: renderSize},
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
    const subs = systemsData[systemType].subsystems;
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
    const options = Object.keys(images.shotlan);
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
    const w = document.createElement('input');
    w.type = 'number';
    w.placeholder = 'Ширина (мм)';
    const h = document.createElement('input');
    h.type = 'number';
    h.placeholder = 'Высота (мм)';
    const btn = document.createElement('button');
    btn.textContent = 'Далее';
    btn.addEventListener('click', () => {
        selected.width = w.value;
        selected.height = h.value;
        if (selected.width && selected.height) showStep(stepIndex + 1);
    });
    container.append(w, h, btn);
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
    resultTable.innerHTML = `<p>Итоговая стоимость: ${calculateTotal()} руб.</p>`;
}

// ----- Пример расчётных функций -----
function calcDoorWidth(width, subsystem, params) {
    return width; // заглушка
}

function calculateComponents() {
    return [];
}

function calculateTotal() {
    // Простая заглушка расчёта стоимости
    const base = 10000;
    return base + Number(selected.width || 0);
}

init();
