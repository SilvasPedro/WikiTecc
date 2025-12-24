document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('dynamic-menu');
    const contentArea = document.getElementById('main-content');
    const searchInput = document.getElementById('search-input');

    // 1. CARREGAR E RENDERIZAR MENU JSON
    fetch('menu.json')
        .then(res => res.json())
        .then(data => {
            menuContainer.innerHTML = data.map(secao => `
                <div class="menu-section">
                    <button class="section-trigger" data-section="${secao.titulo}">
                        <span><i class="${secao.icone}"></i> ${secao.titulo}</span>
                        <i class="fas fa-chevron-down arrow"></i>
                    </button>
                    <div class="section-content">
                        ${secao.links.map(link => `
                            <a href="${link.arquivo}" class="nav-link">${link.label}</a>
                        `).join('')}
                    </div>
                </div>
            `).join('');
            
            // Após renderizar, restaura o estado anterior e configura os eventos
            restoreMenuState();
            setupMenuEvents();
        });

    // 2. EVENTOS DE CLIQUE (MENU E NAVEGAÇÃO)
    function setupMenuEvents() {
        document.querySelectorAll('.section-trigger').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                const content = btn.nextElementSibling;
                content.classList.toggle('show');
                
                // Salva o estado atual após o clique
                saveMenuState();
            });
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const file = link.getAttribute('href');
                loadContent(`pages/${file}`);
            });
        });
    }

    // 3. FUNÇÕES DE LOCAL STORAGE (PRESERVAR POSIÇÃO)
    function saveMenuState() {
        const openSections = [];
        document.querySelectorAll('.section-trigger.active').forEach(btn => {
            // Salva o título da seção que está aberta
            openSections.push(btn.getAttribute('data-section'));
        });
        localStorage.setItem('etecc_open_menus', JSON.stringify(openSections));
    }

    function restoreMenuState() {
        const savedSections = JSON.parse(localStorage.getItem('etecc_open_menus'));
        if (savedSections && savedSections.length > 0) {
            document.querySelectorAll('.section-trigger').forEach(btn => {
                const sectionTitle = btn.getAttribute('data-section');
                if (savedSections.includes(sectionTitle)) {
                    btn.classList.add('active');
                    btn.nextElementSibling.classList.add('show');
                }
            });
        }
    }

    // 4. CARREGAMENTO ASSÍNCRONO (SPA LITE)
    async function loadContent(url) {
        contentArea.style.opacity = '0';
        contentArea.style.transform = 'translateY(10px)';

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error();
            const html = await res.text();

            setTimeout(() => {
                contentArea.innerHTML = html;
                contentArea.style.opacity = '1';
                contentArea.style.transform = 'translateY(0)';
                window.scrollTo(0, 0);
                if (searchInput) searchInput.value = '';
            }, 300);
        } catch (err) {
            contentArea.innerHTML = `<div class="post-card"><h2>Aviso</h2><p>Material não encontrado ou em desenvolvimento.</p></div>`;
            contentArea.style.opacity = '1';
        }
    }

    // 5. FILTRO DE PESQUISA
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.post-card').forEach(card => {
                const isVisible = card.innerText.toLowerCase().includes(term);
                card.classList.toggle('hidden', !isVisible);
            });
        });
    }
});