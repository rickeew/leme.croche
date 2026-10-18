export const money = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );
export const labels = {
  tipo: {
    bolsas: "Bolsa",
    roupas: "Roupa",
    chapeus: "Chapéu",
    acessorios: "Acessório",
  },
  porte: { pequeno: "Pequeno", medio: "Médio", grande: "Grande" },
  cor: {
    amarelo: "Amarelo / mostarda",
    azul: "Azul",
    bege: "Bege / natural",
    bordo: "Bordô",
    branco: "Branco",
    caramelo: "Caramelo",
    cinza: "Cinza",
    laranja: "Laranja",
    marrom: "Marrom",
    multicolor: "Multicolorido",
    oliva: "Verde oliva",
    preto: "Preto",
    rosa: "Rosa",
    roxo: "Roxo / ameixa",
    vermelho: "Vermelho",
  },
};
const normalize = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function filterProducts(products, filters = {}) {
  const terms = normalize(filters.q || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const result = products.filter((p) => {
    const text = normalize(
      [p.nome, p.sku, p.descricao, labels.cor[p.cor], labels.tipo[p.tipo]].join(
        " ",
      ),
    );
    return (
      (!filters.tipo || p.tipo === filters.tipo) &&
      (!filters.porte || p.porte === filters.porte) &&
      (!filters.cor || p.cor === filters.cor) &&
      terms.every((term) => text.includes(term)) &&
      (!filters.preco ||
        (filters.preco === "150"
          ? p.preco <= 150
          : filters.preco === "230"
            ? p.preco > 150 && p.preco <= 230
            : p.preco > 230 && p.preco <= 300))
    );
  });
  if (filters.ordem === "menor")
    result.sort(
      (a, b) => a.preco - b.preco || a.nome.localeCompare(b.nome, "pt-BR"),
    );
  if (filters.ordem === "maior")
    result.sort(
      (a, b) => b.preco - a.preco || a.nome.localeCompare(b.nome, "pt-BR"),
    );
  if (filters.ordem === "nome")
    result.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return result;
}
