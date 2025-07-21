// Инициализация главной страницы
window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('systems-container');
    const viewer = document.getElementById('viewer');
    const viewerContent = viewer.querySelector('.modal-content');
    const showMedia = (type, src) => {
        viewerContent.innerHTML = type === 'video'
            ? `<video src="${src}" controls autoplay style="max-width:90vw;max-height:90vh"></video>`
            : `<img src="${src}" style="max-width:90vw;max-height:90vh">`;
        viewer.classList.remove('hidden');
    };
    viewer.addEventListener('click', e => {
        if (e.target === viewer) {
            viewer.classList.add('hidden');
            viewerContent.innerHTML = '';
        }
    });
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
    const systemOrder = ['cascade','sync','unlinked','embedded-wall','partition','wall-mounted','angle'];
    systemOrder.forEach(code => {
        const data = systemsData[code];
        if (!data) return;
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
        block.addEventListener('dblclick', () => {
            showMedia('video', images.systems[code].src);
        });
        block.addEventListener('click', () => {
            window.location.href = `system.html?type=${code}`;
        });
        container.appendChild(block);
    });

    const phoneInput = document.querySelector('#feedback-form input[type="tel"]');
    if (phoneInput) {
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
        phoneInput.value = '+998 ';
        formatPhone();
        phoneInput.addEventListener('input', formatPhone);
    }
});
