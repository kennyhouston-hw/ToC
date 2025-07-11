document.addEventListener('DOMContentLoaded', () => {
    const HEADER_SELECTOR = 'h2, h3';
    const TARGET_CONTAINER_ID = '#toc';
    const SCROLL_OFFSET = 100;
    const headers = document.querySelectorAll(HEADER_SELECTOR);
    if (headers.length === 0) { return; }
    const tocContainer = document.createElement('div');
    tocContainer.id = 'table-of-contents';
    tocContainer.setAttribute('aria-labelledby', 'toc-main-header');
    tocContainer.innerHTML = `<span id="toc-main-header" class="toc-header">В этой статье:</span>`;
    const tocList = document.createElement('ul');
    tocContainer.appendChild(tocList);
    headers.forEach((header, index) => {
        if (!header.id) { header.id = `toc-header-${index}`; }
        const level = parseInt(header.tagName.replace('H', ''), 10);
        const li = document.createElement('li');
        li.className = `toc-level-${level}`;
        const a = document.createElement('a');
        a.href = `#${header.id}`;
        a.textContent = header.textContent;
        li.appendChild(a);
        tocList.appendChild(li);
    });
    const target = document.querySelector(TARGET_CONTAINER_ID) || document.body;
    target.prepend(tocContainer);
    tocList.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const targetId = e.target.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
        }
    });
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const link = tocList.querySelector(`a[href="#${id}"]`);
            if (entry.isIntersecting && entry.intersectionRatio > 0) {
                tocList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                if (link) { link.parentElement.classList.add('active'); }
            }
        });
    }, { rootMargin: `-${SCROLL_OFFSET - 1}px 0px -${window.innerHeight - SCROLL_OFFSET}px 0px` });
    headers.forEach(header => observer.observe(header));
});
