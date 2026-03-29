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
let modal = null;
let isLoading = true;

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
    inicializarModal();
    inicializarScrollSuave();
}

// ==================== NAVEGAÇÃO ====================

function inicializarNavegacao() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu mobile
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Fechar menu ao clicar em link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
        });
    });

    // Scroll navbar
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
            // Remover active de todos
            filtros.forEach(f => f.classList.remove('active'));
            // Adicionar active ao clicado
            filtro.classList.add('active');

            // Filtrar produtos
            const categoria = filtro.dataset.categoria;
            filtrarProdutos(categoria);
        });
    });
}

function filtrarProdutos(categoria) {
    // Filtrar array de produtos
    if (categoria === 'todos') {
        produtosFiltrados = [...produtos];
    } else {
        produtosFiltrados = produtos.filter(produto => produto.categoria === categoria);
    }

    // Re-renderizar produtos com animação
    const grid = document.getElementById('produtos-grid');
    grid.style.opacity = '0';

    setTimeout(() => {
        renderizarProdutos();
        grid.style.opacity = '1';
    }, 200);
}

// ==================== RENDERIZAÇÃO DE PRODUTOS ====================

function renderizarProdutos() {
    const grid = document.getElementById('produtos-grid');
    if (!grid) return;

    // Limpar grid
    grid.innerHTML = '';

    // Renderizar cada produto
    produtosFiltrados.forEach((produto, index) => {
        const produtoCard = criarCardProduto(produto, index);
        grid.appendChild(produtoCard);
    });

    // Adicionar animação escalonada
    const cards = grid.querySelectorAll('.produto-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in', 'visible');
        }, index * 100);
    });
}

function criarCardProduto(produto) {
    const card = document.createElement('div');
    card.className = 'produto-card fade-in';
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

    // Info
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

    card.appendChild(imageDiv);
    card.appendChild(infoDiv);

    // Evento de clique para abrir modal
    card.addEventListener('click', () => abrirModal(produto));

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

    // Configurar link do Instagram Direct
    const instagramBtn = document.getElementById('modal-instagram');
    const instagramUrl = `https://ig.me/m/leme.croche`;
    instagramBtn.href = instagramUrl;

    // Mostrar modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function fecharModal() {
    if (!modal) return;

    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// ==================== SCROLL SUAVE E ANIMAÇÕES ====================

function inicializarScrollSuave() {
    // Scroll suave para links âncora
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');

            // Verificar se é um link âncora válido
            if (targetId.startsWith('#') && targetId.length > 1 && !targetId.includes('://')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

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
