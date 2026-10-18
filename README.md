# Leme Crochê

Vitrine editorial e catálogo estático. HTML, CSS e JavaScript, sem etapa de build e sem dependências de produção.

- `index.html`: apresentação da marca e seis fotos ambientadas da vitrine anterior.
- `catalogo.html`: 47 peças/variações selecionadas do ZIP, uma foto principal por peça, com preços, busca, filtros e detalhes.
- `produtos.json`: fonte única de nomes, preços e referências do catálogo.
- `images/catalogo/`: versões WebP das fotos refinadas.
- `docs/precificacao.md` e `docs/precos-sugeridos.csv`: critérios, referências e tabela para revisão comercial.

## Executar

Use um servidor HTTP; abrir com `file://` impede o carregamento do JSON e dos módulos em alguns navegadores.

```sh
python -m http.server 8080 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8080`. Para verificar dados, imagens, links e lógica dos filtros:

```sh
npm test
```

## Atualizar produtos

Edite `produtos.json`. Preserve o `sku` de cada peça para não quebrar referências compartilhadas. `preco` é um número em reais, sem símbolo ou separador decimal local. `porte` aceita `pequeno`, `medio`, `grande` ou `nao-informado`. Roupas e chapéus não têm tamanho inferido. As fotos refinadas podem apresentar pequenas variações; confirme detalhes e cores com as fotos originais ao atender uma cliente.

As referências `LEME-001` a `LEME-047` identificam as fotos selecionadas. As imagens antigas `LC-*` permanecem preservadas como ambientação da página inicial. Não foram criados produtos adicionais a partir dessas imagens, pois algumas diferem das fotos originais em cor ou construção. Cada registro mantém `original` para conferir a seleção do ZIP.

Filtros e peças abertas têm URLs compartilháveis, por exemplo `catalogo.html?cor=preto` e `catalogo.html?peca=LEME-033`. Os caminhos relativos permitem servir o site na raiz ou em um subdiretório. O botão único de contato copia uma mensagem com nome, referência e preço e abre o Instagram em outra aba. A cliente toca em Colar no Instagram e decide quando enviar. Se a cópia ou a abertura da aba forem bloqueadas, o diálogo oferece uma alternativa manual. O site não envia mensagens nem processa pagamentos.

## Publicação

O repositório tem integração com Cloudflare Pages, que gera prévias para branches e pull requests. A revisão fica em uma branch separada de `main`; a publicação no domínio depende da configuração de produção do host. O link da prévia aparece no comentário do Cloudflare no PR.

`_headers` é preservado e aplicado pelo Cloudflare Pages. GitHub Pages, também habilitado no repositório, não aplica esse arquivo. Não há etapa de build obrigatória para servir estas páginas estáticas.

## Preços

Os valores entre R$ 80 e R$ 300 são sugestões solicitadas para a vitrine, baseadas em pesquisa e porte estimado pelas fotos. Não são um cálculo de custo ou margem. As páginas informam essa condição. Confirme medidas, materiais, custos, estoque e condições de entrega no atendimento; revise a tabela com esses dados quando estiverem disponíveis.

## Licença

Este projeto está sob a licença MIT, conforme declaração original do repositório.
