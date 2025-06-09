document.addEventListener('DOMContentLoaded', () => {
    // --- Конфигурация ---
    const HEADER_SELECTOR = 'h2, h3';
    const TARGET_CONTAINER_ID = '#toc'; // ID элемента, куда вставить оглавление
    const SCROLL_OFFSET = 100; // Смещение для активного пункта (в пикселях)

    // --- Поиск элементов ---
    const headers = document.querySelectorAll(HEADER_SELECTOR);
    if (headers.length === 0) {
        return; // Если заголовков нет, ничего не делаем
    }

    // --- Создание HTML-структуры ---
    const tocContainer = document.createElement('div');
    tocContainer.id = 'table-of-contents';
    tocContainer.setAttribute('aria-labelledby', 'toc-main-header');

    const tocList = document.createElement('ul');
    
    tocContainer.innerHTML = `
        <span id="toc-main-header" class="header">Содержание</span>
        <button id="toc-close" aria-label="Закрыть содержание">✕</button>
    `;
    tocContainer.appendChild(tocList);

    const overlay = document.createElement('div');
    overlay.id = 'toc-overlay';

    const openButton = document.createElement('button');
    openButton.id = 'toc-toggle';
    openButton.setAttribute('aria-label', 'Открыть содержание');
    openButton.setAttribute('aria-expanded', 'false');
    openButton.setAttribute('aria-controls', 'table-of-contents');
    openButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
        Содержание
    `;

    // --- Функции для открытия/закрытия ---
    const closeToc = () => {
        tocContainer.classList.remove('open');
        overlay.classList.remove('visible');
        openButton.setAttribute('aria-expanded', 'false');
    };

    const openToc = () => {
        tocContainer.classList.add('open');
        overlay.classList.add('visible');
        openButton.setAttribute('aria-expanded', 'true');
        tocContainer.focus(); // Для доступности
    };
    
    // --- Генерация списка оглавления ---
    headers.forEach((header, index) => {
        if (!header.id) {
            header.id = `toc-header-${index}`;
        }
        
        const level = parseInt(header.tagName.replace('H', ''), 10);
        const li = document.createElement('li');
        li.className = `toc-level-${level}`;
        
        const a = document.createElement('a');
        a.href = `#${header.id}`;
        a.textContent = header.textContent;
        li.appendChild(a);
        tocList.appendChild(li);
    });

    // --- Вставка элементов в DOM ---
    const target = document.querySelector(TARGET_CONTAINER_ID) || document.body;
    target.prepend(tocContainer);
    document.body.appendChild(overlay);
    document.body.appendChild(openButton);

    // --- Назначение обработчиков событий ---
    openButton.addEventListener('click', openToc);
    tocContainer.querySelector('#toc-close').addEventListener('click', closeToc);
    overlay.addEventListener('click', closeToc);

    // Делегирование событий для ссылок
    tocList.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const targetId = e.target.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });

            // Закрываем мобильное меню после перехода
            if (tocContainer.classList.contains('open')) {
                closeToc();
            }
        }
    });

    // --- Подсветка активного пункта через Intersection Observer ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const link = tocList.querySelector(`a[href="#${id}"]`);
            if (entry.isIntersecting && entry.intersectionRatio > 0) {
                 // Сначала убираем active со всех
                tocList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                // Потом добавляем к нужному
                if (link) {
                   link.parentElement.classList.add('active');
                }
            }
        });
    }, { 
        rootMargin: `-${SCROLL_OFFSET - 1}px 0px -${window.innerHeight - SCROLL_OFFSET}px 0px`
    });

    headers.forEach(header => observer.observe(header));
});
