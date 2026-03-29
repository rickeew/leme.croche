// ==================== SISTEMA DINÂMICO DE PRODUTOS ====================

// Configurações globais
const CONFIG = {
    urlProdutos: 'produtos.json',
    pastaImagens: 'images/'
};

// Dados dos produtos (carregados dinamicamente)
let produtos = [];

// ==================== FUNÇÕES DE CARREGAMENTO ====================

/**
 * Carrega os dados dos produtos do arquivo JSON
 * @returns {Promise<Array>} - Array de produtos
 */
async function carregarProdutos() {
    try {
        const response = await fetch(CONFIG.urlProdutos);
        if (!response.ok) {
            throw new Error(`Erro ao carregar produtos: ${response.status}`);
        }

        const dados = await response.json();
        const produtosCarregados = dados.produtos || [];

        console.log(`${produtosCarregados.length} produtos carregados com sucesso`);
        return produtosCarregados;

    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        return [];
    }
}

// Configurações e variáveis globais
let produtosFiltrados = [];
let filtroCategoria = 'todos';
let filtroCor = 'todos';
let modal = null;
let isLoading = true;
const DESTAQUE_INDICES = [0, 5, 11];
const mobileQuery = window.matchMedia('(max-width: 768px)');

// Inicialização quando o DOM está carregado
document.addEventListener('DOMContentLoaded', function() {
    inicializarSite();
});

// Função principal de inicialização
async function inicializarSite() {
    try {
        // Carregar produtos do JSON
        produtos = await carregarProdutos();
        produtosFiltrados = [...produtos];

        ocultarLoading();
        inicializarComponentes();
        renderizarProdutos();
        inicializarAnimacoes();
        atualizarAno();

    } catch (error) {
        console.error('Erro na inicialização:', error);

        ocultarLoading();
        inicializarComponentes();
        renderizarProdutos();
        inicializarAnimacoes();
        atualizarAno();
    }
}

// Ocultar tela de loading
function ocultarLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    }
    isLoading = false;
}

// Inicializar todos os componentes
function inicializarComponentes() {
    inicializarNavegacao();
    inicializarFiltros();
    inicializarFiltrosCor();
    inicializarModal();
}

// ==================== NAVEGAÇÃO ====================

function inicializarNavegacao() {
    // Header transparente no topo, sólido ao scrollar
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });
}

// ==================== FILTROS DE PRODUTOS ====================

function inicializarFiltros() {
    const filtros = document.querySelectorAll('.filtro-btn');

    filtros.forEach(filtro => {
        filtro.addEventListener('click', () => {
            filtros.forEach(f => f.classList.remove('active'));
            filtro.classList.add('active');
            filtroCategoria = filtro.dataset.categoria;
            aplicarFiltros();
        });
    });
}

function inicializarFiltrosCor() {
    const filtros = document.querySelectorAll('.filtro-cor');

    filtros.forEach(filtro => {
        filtro.addEventListener('click', () => {
            filtros.forEach(f => f.classList.remove('active'));
            filtro.classList.add('active');
            filtroCor = filtro.dataset.cor;
            aplicarFiltros();
        });
    });
}

function aplicarFiltros() {
    produtosFiltrados = produtos.filter(produto => {
        const passaCategoria = filtroCategoria === 'todos' || produto.categoria === filtroCategoria;
        const passaCor = filtroCor === 'todos' || produto.cor === filtroCor;
        return passaCategoria && passaCor;
    });

    // Re-renderizar com animação
    const grid = document.getElementById('produtos-grid');
    const carousel = document.getElementById('produtos-carousel');
    grid.style.opacity = '0';
    if (carousel) carousel.style.opacity = '0';

    setTimeout(() => {
        renderizarProdutos();
        grid.style.opacity = '1';
        if (carousel) carousel.style.opacity = '1';
    }, 200);
}

// ==================== RENDERIZAÇÃO DE PRODUTOS ====================

function renderizarProdutos() {
    const grid = document.getElementById('produtos-grid');
    const carousel = document.getElementById('produtos-carousel');
    const dotsContainer = document.getElementById('carousel-dots');
    if (!grid) return;

    grid.innerHTML = '';
    if (carousel) carousel.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';

    if (mobileQuery.matches && carousel) {
        renderizarMobile(grid, carousel, dotsContainer);
    } else {
        renderizarDesktop(grid);
    }
}

function renderizarDesktop(grid) {
    produtosFiltrados.forEach((produto, index) => {
        const card = criarCardProduto(produto, index, false);
        grid.appendChild(card);
    });

    animarCards(grid);
}

function renderizarMobile(grid, carousel, dotsContainer) {
    const destaques = [];
    const restantes = [];

    produtosFiltrados.forEach((produto, index) => {
        if (DESTAQUE_INDICES.includes(index)) {
            destaques.push(produto);
        } else {
            restantes.push(produto);
        }
    });

    // Renderizar carousel com destaques
    destaques.forEach((produto) => {
        const card = criarCardProduto(produto, -1, true);
        card.className = 'carousel-card';
        carousel.appendChild(card);
    });

    // Dots
    if (destaques.length > 1 && dotsContainer) {
        destaques.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => {
                carousel.children[i].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            });
            dotsContainer.appendChild(dot);
        });

        // Atualizar dots no scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const idx = Array.from(carousel.children).indexOf(entry.target);
                    dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
                        d.classList.toggle('active', i === idx);
                    });
                }
            });
        }, { root: carousel, threshold: 0.6 });

        Array.from(carousel.children).forEach(card => observer.observe(card));
    }

    // Renderizar grid com restantes
    restantes.forEach((produto) => {
        const card = criarCardProduto(produto, -1, false);
        card.classList.remove('destaque');
        grid.appendChild(card);
    });

    animarCards(grid);
}

function animarCards(container) {
    const cards = container.querySelectorAll('.produto-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in', 'visible');
        }, index * 100);
    });
}

function criarCardProduto(produto, index, isCarousel) {
    const card = document.createElement('div');
    const isDestaque = !isCarousel && DESTAQUE_INDICES.includes(index);
    card.className = 'produto-card fade-in' + (isDestaque ? ' destaque' : '');
    card.dataset.categoria = produto.categoria;

    // Imagem
    const imageDiv = document.createElement('div');
    imageDiv.className = 'produto-image';

    const img = document.createElement('img');
    img.src = produto.imagem;
    img.alt = produto.nome;
    img.addEventListener('error', function() {
        this.style.display = 'none';
        placeholder.style.display = 'flex';
    });

    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.style.display = 'none';
    const placeholderIcon = document.createElement('i');
    placeholderIcon.className = 'fas fa-shopping-bag';
    placeholder.appendChild(placeholderIcon);

    imageDiv.appendChild(img);
    imageDiv.appendChild(placeholder);

    // Info (desktop)
    const infoDiv = document.createElement('div');
    infoDiv.className = 'produto-info';

    const nome = document.createElement('h3');
    nome.textContent = produto.nome;

    const sku = document.createElement('p');
    sku.className = 'produto-sku';
    sku.textContent = produto.sku;

    const categoria = document.createElement('p');
    categoria.className = 'produto-categoria';
    categoria.textContent = formatarCategoria(produto.categoria);

    const descricao = document.createElement('p');
    descricao.className = 'produto-descricao';
    descricao.textContent = produto.descricao.length > 80
        ? produto.descricao.substring(0, 80) + '...'
        : produto.descricao;

    infoDiv.appendChild(nome);
    infoDiv.appendChild(sku);
    infoDiv.appendChild(categoria);
    infoDiv.appendChild(descricao);

    // Overlay — nome + SKU + categoria + descrição sobre a imagem
    const overlay = document.createElement('div');
    overlay.className = 'produto-overlay';

    const overlayNome = document.createElement('h3');
    overlayNome.textContent = produto.nome;

    const overlaySku = document.createElement('p');
    overlaySku.className = 'produto-sku';
    overlaySku.textContent = produto.sku;

    const overlayCat = document.createElement('p');
    overlayCat.className = 'produto-categoria';
    overlayCat.textContent = formatarCategoria(produto.categoria);

    const overlayDesc = document.createElement('p');
    overlayDesc.className = 'produto-descricao';
    overlayDesc.textContent = produto.descricao.length > 80
        ? produto.descricao.substring(0, 80) + '...'
        : produto.descricao;

    overlay.appendChild(overlayNome);
    overlay.appendChild(overlaySku);
    overlay.appendChild(overlayCat);
    overlay.appendChild(overlayDesc);

    card.appendChild(imageDiv);
    card.appendChild(infoDiv);
    card.appendChild(overlay);

    // Clique: no mobile, primeiro tap mostra overlay, segundo abre modal
    // No desktop, abre modal direto
    card.addEventListener('click', () => {
        if (mobileQuery.matches && !isCarousel) {
            if (card.classList.contains('mostrar-overlay')) {
                abrirModal(produto);
            } else {
                // Fechar overlays de outros cards
                document.querySelectorAll('.produto-card.mostrar-overlay').forEach(c => {
                    c.classList.remove('mostrar-overlay');
                });
                card.classList.add('mostrar-overlay');
            }
        } else {
            abrirModal(produto);
        }
    });

    return card;
}

function formatarCategoria(categoria) {
    const categorias = {
        'pequenas': 'Bolsas Pequenas',
        'medias': 'Bolsas Médias',
        'grandes': 'Bolsas Grandes'
    };
    return categorias[categoria] || categoria;
}

// ==================== MODAL ====================

function inicializarModal() {
    modal = document.getElementById('produto-modal');
    const closeBtn = document.querySelector('.modal-close');

    // Fechar modal
    closeBtn?.addEventListener('click', fecharModal);

    // Fechar modal clicando fora
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('show')) {
            fecharModal();
        }
    });
}

function abrirModal(produto) {
    if (!modal) return;

    // Preencher dados do modal
    document.getElementById('modal-titulo').textContent = produto.nome;
    document.getElementById('modal-sku').textContent = produto.sku;
    document.getElementById('modal-categoria').textContent = formatarCategoria(produto.categoria);
    document.getElementById('modal-descricao').textContent = produto.descricao;

    // Configurar imagem
    const modalImg = document.getElementById('modal-img');
    modalImg.src = produto.imagem;
    modalImg.alt = produto.nome;

    // Texto contextual
    document.getElementById('modal-cta-texto').textContent =
        `Gostou da ${produto.nome}? Envie uma mensagem para saber disponibilidade ou encomendar uma sob medida.`;

    // Link do Instagram Direct
    const instagramBtn = document.getElementById('modal-instagram');
    instagramBtn.href = `https://ig.me/m/leme.croche`;

    // Mostrar modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function fecharModal() {
    if (!modal) return;

    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// ==================== ANIMAÇÕES ====================

function inicializarAnimacoes() {
    // Intersection Observer para animações on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observar elementos com animação
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// ==================== UTILITÁRIOS ====================

function atualizarAno() {
    const anoElement = document.getElementById('ano');
    if (anoElement) {
        anoElement.textContent = new Date().getFullYear();
    }
}

// Re-renderizar ao mudar entre mobile/desktop
mobileQuery.addEventListener('change', () => {
    renderizarProdutos();
});

// Fechar overlay ao clicar fora dos cards
document.addEventListener('click', (e) => {
    if (!e.target.closest('.produto-card')) {
        document.querySelectorAll('.produto-card.mostrar-overlay').forEach(c => {
            c.classList.remove('mostrar-overlay');
        });
    }
});

// Expor funções globalmente para facilitar manutenção
window.LemeCroche = {
    recarregarProdutos: async function() {
        produtos = await carregarProdutos();
        produtosFiltrados = [...produtos];
        renderizarProdutos();
    },
    get produtos() { return produtos; },
    get config() { return CONFIG; }
};
