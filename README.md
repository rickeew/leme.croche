# 🧶 Leme Crochê - Site de Portfólio

Site estático profissional para venda de bolsas de crochê artesanais, otimizado para GitHub Pages.

## 📋 Sobre o Projeto

Site responsivo e moderno criado para exibir e vender bolsas de crochê artesanais. Desenvolvido com tecnologias web padrão para facilitar a manutenção e hospedagem gratuita no GitHub Pages.

### ✨ Funcionalidades

- 🎨 **Design Responsivo**: Adaptado para todos os dispositivos
- 🔍 **Filtros de Produtos**: Por categoria (pequenas, médias, grandes)
- 🖼️ **Galeria Interativa**: Modal com detalhes ampliados
- 📱 **Integração WhatsApp**: Contato direto para vendas
- 📝 **Formulário de Contato**: Envio automático via WhatsApp
- ⚡ **Loading Suave**: Experiência de usuário aprimorada
- 🌟 **Animações Discretas**: Transições elegantes

## 🗂️ Estrutura de Arquivos

```
LemeCroche/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # JavaScript interativo
├── README.md           # Este arquivo
└── images/             # Pasta das imagens dos produtos
    ├── bolsa1.jpg
    ├── bolsa2.jpg
    ├── ...
    └── bolsa8.jpg
```

## 🚀 Como Usar

### 1. Hospedagem no GitHub Pages

1. **Fork ou Clone** este repositório
2. Vá para **Settings** do repositório
3. Em **Pages**, selecione **Deploy from a branch**
4. Escolha **main branch** e pasta **/ (root)**
5. Seu site estará disponível em: `https://seuusuario.github.io/LemeCroche`

### 2. Executar Localmente

```bash
# Clone o repositório
git clone https://github.com/seuusuario/LemeCroche.git

# Entre na pasta
cd LemeCroche

# Abra o index.html no navegador
# Ou use um servidor local como Live Server (VS Code)
```

## 🛠️ Como Adicionar Novos Produtos

### Método 1: Editando o JavaScript (Recomendado)

1. Abra o arquivo `script.js`
2. Localize o array `produtos` no início do arquivo
3. Adicione um novo objeto seguindo o padrão:

```javascript
{
    id: 9, // Próximo ID disponível
    nome: "Nome da Bolsa",
    categoria: "pequenas", // pequenas, medias ou grandes
    preco: "R$ 00,00",
    descricao: "Descrição completa da bolsa com detalhes, materiais e características especiais.",
    imagem: "images/bolsa9.jpg",
    cores: ["cor1", "cor2"]
}
```

### Método 2: Via Console do Navegador

1. Abra o site no navegador
2. Pressione **F12** para abrir o DevTools
3. Vá para a aba **Console**
4. Use a função helper:

```javascript
LemeCroche.adicionarNovoProduto({
    id: 9,
    nome: "Bolsa Nova",
    categoria: "medias",
    preco: "R$ 80,00",
    descricao: "Descrição da nova bolsa...",
    imagem: "images/bolsa9.jpg",
    cores: ["azul", "branco"]
});
```

### 3. Adicionando Imagens

1. **Adicione a imagem** na pasta `images/`
2. **Nomeie** seguindo o padrão: `bolsaX.jpg` (onde X é o número)
3. **Referencie** corretamente no campo `imagem` do produto
4. **Recomendações**:
   - Formato: JPG ou PNG
   - Tamanho: máximo 800x800px
   - Peso: máximo 500KB para loading rápido

## 📞 Como Atualizar Informações de Contato

### No JavaScript (script.js)

Localize e altere os seguintes valores:

```javascript
// Número do WhatsApp (com código do país, sem + ou espaços)
const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(mensagem)}`;

// Instagram handle (sem @)
const instagramUrl = "https://instagram.com/lemecroche";

// E-mail
const email = "contato@lemecroche.com";
```

### Via Console (Método Rápido)

```javascript
LemeCroche.atualizarContato(
    "5511999999999",           // Novo WhatsApp
    "novoinstagram",           // Novo Instagram
    "novo@email.com"           // Novo e-mail
);
```

### No HTML (index.html)

Busque e substitua todas as ocorrências de:
- `(11) 99999-9999` → Seu número
- `@lemecroche` → Seu Instagram
- `contato@lemecroche.com` → Seu e-mail

## 🎨 Personalização de Cores

Para alterar a paleta de cores, edite as variáveis CSS no início do arquivo `styles.css`:

```css
:root {
    --primary-color: #d4a574;      /* Cor principal */
    --primary-dark: #b8935f;       /* Cor principal escura */
    --secondary-color: #f4e4d6;    /* Cor secundária */
    --accent-color: #e8b4a0;       /* Cor de destaque */
    /* ... outras cores ... */
}
```

### Paletas Sugeridas

**Tons Rosados:**
```css
--primary-color: #d4947a;
--primary-dark: #c17b5f;
--secondary-color: #f4e1d6;
--accent-color: #e8a4a0;
```

**Tons Azuis:**
```css
--primary-color: #7a94d4;
--primary-dark: #5f7bc1;
--secondary-color: #d6e1f4;
--accent-color: #a0a4e8;
```

## 📱 Redes Sociais e SEO

### Atualizando Meta Tags

No `<head>` do index.html, personalize:

```html
<title>Seu Nome - Bolsas Artesanais</title>
<meta name="description" content="Sua descrição personalizada">
```

### Links das Redes Sociais

Atualize todos os links no HTML:
- WhatsApp: `https://wa.me/SEUNUMERO`
- Instagram: `https://instagram.com/SEUINSTAGRAM`
- E-mail: `mailto:SEUEMAIL`

## 🔧 Manutenção e Dicas

### Backup Regular
- Sempre faça backup antes de grandes mudanças
- Use o controle de versão do Git

### Performance
- Otimize imagens antes de upload (use TinyPNG ou similar)
- Mantenha descrições dos produtos concisas
- Teste regularmente em dispositivos móveis

### Debug e Testes
```javascript
// No console do navegador
LemeCroche.debugSite(); // Ver informações do site
```

### Categorias Disponíveis
- `pequenas` → Bolsas Pequenas
- `medias` → Bolsas Médias  
- `grandes` → Bolsas Grandes

## 🐛 Solução de Problemas Comuns

### Imagens não aparecem
- Verifique se o arquivo existe na pasta `images/`
- Confirme se o nome está correto no JavaScript
- Teste o caminho da imagem diretamente no navegador

### Filtros não funcionam
- Verifique se a categoria está correta (`pequenas`, `medias`, `grandes`)
- Confirme se não há erros no console (F12 → Console)

### WhatsApp não abre
- Confirme se o número está no formato correto: `5511999999999`
- Teste o link diretamente copiando e colando

### Site não carrega no GitHub Pages
- Aguarde até 10 minutos após o deploy
- Verifique se o repositório é público
- Confirme se as configurações do Pages estão corretas

## 📄 Licença

Este projeto está sob a licença MIT. Você pode usar, modificar e distribuir livremente.

## 💡 Suporte

Para dúvidas ou problemas:
1. Verifique esta documentação
2. Teste no console do navegador com `LemeCroche.debugSite()`
3. Consulte a comunidade do GitHub

---

**💝 Feito com amor para artesãs de crochê!**

*Transforme sua paixão em um negócio online profissional.*