# Validação — 18/10/2026

- `npm test`: 6 testes aprovados. Cobrem 47 produtos únicos, imagens existentes, faixa R$ 80–300, busca sem acentos, combinação de filtros, ordenação, vínculo entre porte e preço e links locais das duas páginas.
- `node --check script.js` e `node --check catalogo-core.js`: sem erro de sintaxe.
- `git diff --check`: sem erros de espaços em branco.
- 47 imagens WebP abertas e verificadas com Pillow; total aproximado de 9,7 MB. Carregamento adiado nas fotos do catálogo.
- Navegador: catálogo carregou 47 peças; busca `chapeu` retornou 2; combinação bolsa + pequeno + preto + R$ 151–230 retornou 4; busca inexistente mostrou estado vazio e botão de limpeza.
- Ordenação por maior preço colocou uma peça de R$ 300 primeiro e permaneceu após recarregar.
- Detalhes: preço, cor, referência e porte renderizados; Esc fechou o diálogo e devolveu foco ao cartão. Cópia de referência confirmou sucesso, sem enviar mensagem.
- Link `catalogo.html?peca=LEME-033` abriu diretamente a Bolsa Caramelo Franjas, R$ 170.
- Teste de falha: JSON temporariamente indisponível produziu mensagem de erro e botão de nova tentativa. Após restaurar o JSON, o botão recuperou os produtos e o filtro ativo.
- Layouts de 320 px e 390 px sem rolagem horizontal. Menu móvel abriu o catálogo; filtro de porte ficou desativado para roupas. Vitrine e detalhes também inspecionados no viewport padrão de desktop.
- Console sem avisos ou erros no fluxo normal inspecionado. O erro HTTP do teste de indisponibilidade foi provocado e não representa um arquivo faltante na versão final.

- A integração existente publicou a prévia do commit `054179c` no Cloudflare Pages. Página inicial, catálogo, busca pela referência e diálogo da Bolsa Caramelo Franjas (R$ 170) foram verificados também no host, sem erros ou avisos de console no fluxo inspecionado.

As capturas foram salvas no diretório local de trabalho, fora do código de produção. Não foi feita uma auditoria completa de acessibilidade, de dispositivos físicos ou da configuração de publicação do domínio. Preços e portes continuam estimados conforme `precificacao.md`.

## Botão único de contato — 18/10/2026

- “Copiar mensagem e abrir Instagram” substitui as duas ações separadas nos detalhes. A mensagem inclui nome, referência e preço em reais; a cliente ainda precisa colar e enviar no Instagram.
- `npm test`: 10 testes aprovados. Os quatro cenários adicionais cobrem conteúdo da mensagem, abertura da aba ainda no clique, navegação somente após a cópia e alternativas quando clipboard/aba são bloqueados.
- No navegador, um clique confirmou sucesso da API de cópia e abriu o destino `instagram.com/m/leme.croche`. Na sessão de teste sem autenticação, o Instagram redirecionou para o login. Não foi feito login nem enviada mensagem.
- A aba nova fica sem acesso à janela do catálogo antes de navegar ao Instagram. Se a cópia falhar, a aba vazia é fechada e a mensagem completa fica disponível para seleção manual no catálogo.
