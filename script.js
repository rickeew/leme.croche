// ==================== SISTEMA DINÂMICO DE PRODUTOS ====================

// Configurações globais
const CONFIG = {
    urlProdutos: 'produtos.json',
    formatosImagem: ['jpg', 'jpeg', 'png', 'webp'],
    pastaImagens: 'images/',
    imagemPlaceholder: 'images/placeholder.jpg'
};

// Dados dos produtos (carregados dinamicamente)
let produtos = [];
let dadosOriginais = null;

// ==================== FUNÇÕES DE CARREGAMENTO ====================

/**
 * Detecta automaticamente a imagem disponível para um produto
 * @param {string} imagemBase - Nome base da imagem (ex: "bolsa01")
 * @returns {string} - Caminho da imagem encontrada ou placeholder
 */
async function detectarImagem(imagemBase) {
    for (const formato of CONFIG.formatosImagem) {
        const caminhoImagem = `${CONFIG.pastaImagens}${imagemBase}.${formato}`;

        try {
            // Verifica se a imagem existe fazendo uma requisição HEAD
            const response = await fetch(caminhoImagem, { method: 'HEAD' });
            if (response.ok) {
                return caminhoImagem;
            }
        } catch (error) {
            // Continua tentando outros formatos
            continue;
        }
    }

    // Se não encontrou nenhuma imagem, retorna placeholder
    return CONFIG.imagemPlaceholder;
}

/**
 * Carrega os dados dos produtos do arquivo JSON
 * @returns {Promise<Array>} - Array de produtos processados
 */
async function carregarProdutos() {
    try {
        console.log('Carregando produtos do JSON...');

        // Carrega o arquivo JSON
        const response = await fetch(CONFIG.urlProdutos);
        if (!response.ok) {
            throw new Error(`Erro ao carregar produtos: ${response.status}`);
        }

        dadosOriginais = await response.json();
        const produtosCarregados = dadosOriginais.produtos || [];

        // Processa cada produto para detectar imagens automaticamente
        const produtosProcessados = await Promise.all(
            produtosCarregados.map(async (produto) => {
                const imagemDetectada = await detectarImagem(produto.imagemBase);

                return {
                    ...produto,
                    imagem: imagemDetectada,
                    imagemEncontrada: imagemDetectada !== CONFIG.imagemPlaceholder
                };
            })
        );

        console.log(`${produtosProcessados.length} produtos carregados com sucesso`);
        return produtosProcessados;

    } catch (error) {
        console.error('Erro ao carregar produtos:', error);

        // Fallback: retorna produtos de exemplo se houver erro
        return carregarProdutosFallback();
    }
}

/**
 * Produtos de fallback caso o JSON não carregue
 */
function carregarProdutosFallback() {
    console.warn('Usando produtos de fallback...');

    return [
        {
            id: 1,
            nome: "Bolsa Artesanal",
            categoria: "medias",
            preco: "R$ 65,00",
            descricao: "Bolsa artesanal feita em crochê com muito carinho e dedicação.",
            imagem: "images/bolsa01.png",
            cores: ["Variadas"],
            imagemEncontrada: true
        }
    ];
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

        // Simular loading mínimo para UX
        setTimeout(() => {
            ocultarLoading();
            inicializarComponentes();
            renderizarProdutos();
            inicializarAnimacoes();
        }, 1000);

    } catch (error) {
        console.error('Erro na inicialização:', error);

        // Em caso de erro, ainda inicializa o site com fallback
        setTimeout(() => {
            ocultarLoading();
            inicializarComponentes();
            renderizarProdutos();
            inicializarAnimacoes();
        }, 1500);
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
    inicializarFormulario();
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

function criarCardProduto(produto, index) {
    const card = document.createElement('div');
    card.className = 'produto-card fade-in';
    card.dataset.categoria = produto.categoria;
    
    card.innerHTML = `
        <div class="produto-image">
            <img src="${produto.imagem}" alt="${produto.nome}" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="image-placeholder" style="display: none;">
                <i class="fas fa-shopping-bag"></i>
            </div>
        </div>
        <div class="produto-info">
            <h3>${produto.nome}</h3>
            <p class="produto-categoria">${formatarCategoria(produto.categoria)}</p>
            <p class="produto-preco">${produto.preco}</p>
            <p class="produto-descricao">${produto.descricao.substring(0, 80)}...</p>
        </div>
    `;
    
    // Adicionar evento de clique para abrir modal
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
    document.getElementById('modal-categoria').textContent = formatarCategoria(produto.categoria);
    document.getElementById('modal-preco').textContent = produto.preco;
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

// ==================== FORMULÁRIO DE CONTATO ====================

function inicializarFormulario() {
    const form = document.getElementById('contato-formulario');
    
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        processarFormulario();
    });
}

function processarFormulario() {
    // Obter dados do formulário
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const mensagem = document.getElementById('mensagem').value;
    
    // Criar mensagem para WhatsApp
    const mensagemWhatsApp = `
*Novo contato pelo site!*

*Nome:* ${nome}
*E-mail:* ${email}
*Telefone:* ${telefone || 'Não informado'}

*Mensagem:*
${mensagem}
    `.trim();
    
    // Redirecionar para WhatsApp
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(mensagemWhatsApp)}`;
    window.open(whatsappUrl, '_blank');
    
    // Mostrar mensagem de sucesso
    mostrarMensagemSucesso();
    
    // Limpar formulário
    document.getElementById('contato-formulario').reset();
}

function mostrarMensagemSucesso() {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = 'notificacao-sucesso';
    notificacao.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Mensagem enviada! Você será redirecionado para o WhatsApp.</span>
    `;
    
    // Adicionar estilos inline
    Object.assign(notificacao.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#25d366',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        zIndex: '9999',
        animation: 'slideInRight 0.3s ease'
    });
    
    // Adicionar ao DOM
    document.body.appendChild(notificacao);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notificacao.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notificacao);
        }, 300);
    }, 5000);
}

// ==================== SCROLL SUAVE E ANIMAÇÕES ====================

function inicializarScrollSuave() {
    // Scroll suave para links âncora
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');

            // Verificar se é um link âncora válido (começando com # e contendo apenas id válido)
            if (targetId.startsWith('#') && targetId.length > 1 && !targetId.includes('://')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80; // Account for fixed header
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

// ==================== FUNÇÕES DE MANUTENÇÃO DINÂMICA ====================

/**
 * Adiciona um novo produto dinamicamente
 * @param {Object} novoProduto - Dados do novo produto
 */
async function adicionarNovoProduto(novoProduto) {
    /*
    COMO ADICIONAR UM NOVO PRODUTO:

    1. Chame esta função passando um objeto com as seguintes propriedades:

    await adicionarNovoProduto({
        nome: "Nome da Bolsa",
        categoria: "pequenas", // pequenas, medias ou grandes
        preco: "R$ 00,00",
        descricao: "Descrição completa da bolsa...",
        imagemBase: "bolsa09", // Nome base da imagem (sem extensão)
        cores: ["cor1", "cor2"] // Array com cores disponíveis
    });

    2. Coloque a imagem na pasta images/ com o nome especificado em imagemBase
       (ex: bolsa09.jpg, bolsa09.png, etc.)
    3. A imagem será detectada automaticamente
    4. O ID será gerado automaticamente
    */

    try {
        // Gerar ID automaticamente
        const proximoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;

        // Detectar imagem automaticamente
        const imagemDetectada = await detectarImagem(novoProduto.imagemBase);

        // Criar produto completo
        const produtoCompleto = {
            id: proximoId,
            ...novoProduto,
            imagem: imagemDetectada,
            imagemEncontrada: imagemDetectada !== CONFIG.imagemPlaceholder
        };

        // Adicionar aos arrays
        produtos.push(produtoCompleto);
        produtosFiltrados = [...produtos];

        // Atualizar visualização
        renderizarProdutos();

        console.log('✅ Produto adicionado com sucesso:', produtoCompleto.nome);
        console.log('📸 Imagem detectada:', imagemDetectada);

        return produtoCompleto;

    } catch (error) {
        console.error('❌ Erro ao adicionar produto:', error);
        throw error;
    }
}

/**
 * Recarrega todos os produtos do JSON
 */
async function recarregarProdutos() {
    try {
        console.log('🔄 Recarregando produtos...');

        produtos = await carregarProdutos();
        produtosFiltrados = [...produtos];
        renderizarProdutos();

        console.log('✅ Produtos recarregados com sucesso');

    } catch (error) {
        console.error('❌ Erro ao recarregar produtos:', error);
    }
}

/**
 * Exporta os produtos atuais para JSON (para debug/backup)
 */
function exportarProdutos() {
    const dadosExportacao = {
        produtos: produtos.map(p => ({
            id: p.id,
            nome: p.nome,
            categoria: p.categoria,
            preco: p.preco,
            descricao: p.descricao,
            cores: p.cores,
            imagemBase: p.imagemBase || `bolsa${String(p.id).padStart(2, '0')}`
        })),
        configuracao: CONFIG
    };

    console.log('📄 Dados para produtos.json:');
    console.log(JSON.stringify(dadosExportacao, null, 2));

    return dadosExportacao;
}

// Função para atualizar informações de contato
function atualizarContato(novoTelefone, novoInstagram, novoEmail) {
    /*
    COMO ATUALIZAR INFORMAÇÕES DE CONTATO:
    
    atualizarContato(
        "5511999999999", // Novo número do WhatsApp (com código do país)
        "lemecroche", // Novo usuário do Instagram (sem @)
        "contato@lemecroche.com" // Novo e-mail
    );
    */
    
    // Atualizar links do WhatsApp
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        const href = link.getAttribute('href');
        const newHref = href.replace(/wa\.me\/\d+/, `wa.me/${novoTelefone}`);
        link.setAttribute('href', newHref);
    });
    
    // Atualizar links do Instagram
    document.querySelectorAll('a[href*="instagram.com"]').forEach(link => {
        link.setAttribute('href', `https://instagram.com/${novoInstagram}`);
    });
    
    // Atualizar textos de contato
    document.querySelectorAll('p').forEach(p => {
        if (p.textContent.includes('@')) {
            p.textContent = p.textContent.replace(/@\w+/, `@${novoInstagram}`);
        }
        if (p.textContent.includes('contato@')) {
            p.textContent = p.textContent.replace(/\S+@\S+\.\S+/, novoEmail);
        }
    });
    
    console.log('Informações de contato atualizadas!');
}

// Função para debug (modo desenvolvimento)
function debugSite() {
    console.log('=== DEBUG LEME CROCHÊ ===');
    console.log('Produtos carregados:', produtos.length);
    console.log('Produtos filtrados:', produtosFiltrados.length);
    console.log('Loading completo:', !isLoading);
    console.log('Modal inicializado:', !!modal);
    console.log('Produtos:', produtos);
}

// Expor funções globalmente para facilitar manutenção
window.LemeCroche = {
    // Funções principais
    adicionarNovoProduto,
    recarregarProdutos,
    exportarProdutos,
    atualizarContato,
    debugSite,

    // Dados
    get produtos() { return produtos; },
    get produtosFiltrados() { return produtosFiltrados; },
    get dadosOriginais() { return dadosOriginais; },
    get config() { return CONFIG; },

    // Funções internas (para debug avançado)
    detectarImagem,
    carregarProdutos
};

// Adicionar estilos para animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notificacao-sucesso {
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
    }
`;
document.head.appendChild(style);