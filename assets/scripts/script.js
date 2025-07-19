// Инициализация главной страницы
window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('systems-container');
    const stepsBar = document.getElementById('steps-bar');
    const stepItems = [
        { key: 'system', title: 'Тип системы' },
        { key: 'subsystem', title: 'Подсистема' },
        { key: 'glass', title: 'Стекло' },
        { key: 'shotlan', title: 'Шотланки' }
    ];

    stepItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'step';
        div.innerHTML = `<span class="step-name">${item.title}</span><span class="step-value"></span>`;
        stepsBar.appendChild(div);
    });
    Object.keys(systemsData).forEach(code => {
        const data = systemsData[code];
        const block = document.createElement('div');
        block.className = 'system-block';
        block.innerHTML = `
            <img src="${images.systems[code].poster}" alt="${data.name}">
            <video muted loop preload="none" src="${images.systems[code].src}"></video>
            <span class="system-title">${data.name}</span>
        `;
        block.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                const video = block.querySelector('video');
                video.style.display = 'block';
                video.play();
            }
        });
        block.addEventListener('mouseleave', () => {
            const video = block.querySelector('video');
            video.pause();
            video.style.display = 'none';
        });
        block.addEventListener('click', () => {
            window.location.href = `system.html?type=${code}`;
        });
        container.appendChild(block);
    });
});
