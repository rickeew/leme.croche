import { filterProducts, money, labels } from "./catalogo-core.js";

document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector("#nav");
function closeMenu() {
  menuButton?.setAttribute("aria-expanded", "false");
  nav?.classList.remove("is-open");
}
menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("is-open", open);
});
nav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav?.classList.contains("is-open")) {
    closeMenu();
    menuButton.focus();
  }
});
if (document.body.dataset.page === "catalogo") initCatalog();

function initCatalog() {
  const grid = document.querySelector("#products");
  const count = document.querySelector("#result-count");
  const dialog = document.querySelector("#product-dialog");
  const fields = {
    q: document.querySelector("#busca"),
    porte: document.querySelector("#porte"),
    cor: document.querySelector("#cor"),
    preco: document.querySelector("#preco"),
    ordem: document.querySelector("#ordem"),
  };
  let products = [],
    currentProduct = null,
    trigger = null,
    type = "";
  function readURL() {
    const params = new URLSearchParams(location.search);
    type = ["bolsas", "roupas", "chapeus", "acessorios"].includes(
      params.get("tipo"),
    )
      ? params.get("tipo")
      : "";
    for (const [name, field] of Object.entries(fields)) {
      const value = params.get(name) || (name === "ordem" ? "colecao" : "");
      field.value =
        field.tagName === "SELECT" &&
        ![...field.options].some((o) => o.value === value)
          ? name === "ordem"
            ? "colecao"
            : ""
          : value.slice(0, 120);
    }
  }
  function state() {
    return {
      tipo: type,
      ...Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, v.value]),
      ),
    };
  }
  function updateURL() {
    const params = new URLSearchParams();
    for (const [name, value] of Object.entries(state()))
      if (value && value !== "colecao") params.set(name, value);
    if (dialog.open && currentProduct) params.set("peca", currentProduct.sku);
    history.replaceState(
      null,
      "",
      `${location.pathname}${params.size ? `?${params}` : ""}${location.hash}`,
    );
  }
  function element(tag, className, content) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content != null) el.textContent = content;
    return el;
  }
  function card(p) {
    const article = element("article", "product-card");
    const button = element("button");
    button.type = "button";
    button.setAttribute(
      "aria-label",
      `Ver detalhes: ${p.nome}, ${money(p.preco)}`,
    );
    const photo = element("div", "product-image");
    const img = element("img");
    Object.assign(img, {
      src: p.imagem,
      alt: p.nome,
      loading: "lazy",
      decoding: "async",
      width: 1086,
      height: 1448,
    });
    const arrow = element("span", "product-arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");
    photo.append(img, arrow);
    const copy = element("div", "product-copy");
    const meta = element("div", "product-meta");
    meta.append(
      element("span", "", labels.tipo[p.tipo]),
      element("span", "", p.sku),
    );
    const price = element("p", "product-price", money(p.preco));
    price.append(element("small", "", " referência"));
    copy.append(
      meta,
      element("h2", "", p.nome),
      price,
      element("span", "product-view", "Ver detalhes da peça ↗"),
    );
    button.append(photo, copy);
    article.append(button);
    button.addEventListener("click", () => openProduct(p, button));
    return article;
  }
  function render(syncURL = true) {
    if (!products.length) return;
    const hasBagSize = type !== "roupas" && type !== "chapeus";
    fields.porte.disabled = !hasBagSize;
    if (!hasBagSize) fields.porte.value = "";
    const filters = state(),
      result = filterProducts(products, filters);
    grid.replaceChildren(...result.map(card));
    const filtered = Boolean(
      type || filters.q || filters.porte || filters.cor || filters.preco,
    );
    count.textContent = filtered
      ? `${result.length} de ${products.length} peças`
      : `${products.length} peças para descobrir`;
    document.querySelector("#empty").hidden = result.length !== 0;
    document.querySelector("#limpar").hidden = !filtered;
    document
      .querySelectorAll("[data-type]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.type === type)),
      );
    if (syncURL) updateURL();
  }
  function reset() {
    type = "";
    Object.entries(fields).forEach(([name, field]) => {
      field.value = name === "ordem" ? "colecao" : "";
    });
    render();
  }
  function openProduct(p, button) {
    currentProduct = p;
    trigger = button || null;
    const photo = document.querySelector("#detail-image");
    photo.src = p.imagem;
    photo.alt = p.nome;
    for (const [id, value] of Object.entries({
      "detail-type": labels.tipo[p.tipo],
      "detail-name": p.nome,
      "detail-price": money(p.preco),
      "detail-reference": `Referência ${p.sku}`,
      "detail-description": p.descricao,
      "detail-color": labels.cor[p.cor],
      "detail-size-label": p.porteEstimado ? "Porte estimado" : "Medidas",
      "detail-size": p.porteEstimado
        ? labels.porte[p.porte]
        : "Confirme com a Leme",
      "copy-status": "",
    }))
      document.getElementById(id).textContent = value;
    if (!dialog.open) dialog.showModal();
    updateURL();
  }
  dialog
    .querySelector(".dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const box = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom)
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    currentProduct = null;
    updateURL();
    trigger?.focus();
  });
  document
    .querySelector("#copy-reference")
    .addEventListener("click", async () => {
      if (!currentProduct) return;
      const p = currentProduct,
        message = `Olá! Gostei da ${p.nome} (${p.sku}), com preço de referência de ${money(p.preco)}. Pode me informar as medidas, a disponibilidade e o valor final?`;
      try {
        await navigator.clipboard.writeText(message);
        document.querySelector("#copy-status").textContent =
          "Referência copiada! Cole na conversa do Instagram.";
      } catch {
        document.querySelector("#copy-status").textContent =
          `Copie manualmente: ${p.sku} — ${p.nome}.`;
      }
    });
  document.querySelectorAll("[data-type]").forEach((button) =>
    button.addEventListener("click", () => {
      type = button.dataset.type;
      render();
    }),
  );
  fields.q.addEventListener("input", () => render());
  Object.entries(fields)
    .filter(([name]) => name !== "q")
    .forEach(([, field]) => field.addEventListener("change", () => render()));
  document.querySelector("#limpar").addEventListener("click", reset);
  document.querySelector("[data-reset]").addEventListener("click", () => {
    reset();
    fields.q.focus();
  });
  window.addEventListener("popstate", () => {
    readURL();
    render(false);
    const product = products.find(
      (p) => p.sku === new URLSearchParams(location.search).get("peca"),
    );
    if (product) openProduct(product);
    else if (dialog.open) dialog.close();
  });
  async function load() {
    grid.setAttribute("aria-busy", "true");
    Object.values(fields).forEach((field) => {
      field.disabled = true;
    });
    document.querySelectorAll("[data-type]").forEach((button) => {
      button.disabled = true;
    });
    document.querySelector("#retry").disabled = true;
    document.querySelector("#load-error").hidden = true;
    count.textContent = "Carregando as peças…";
    try {
      const response = await fetch(new URL("./produtos.json", import.meta.url));
      if (!response.ok) throw new Error("Catálogo indisponível");
      const data = await response.json();
      if (!Array.isArray(data.produtos) || !data.produtos.length)
        throw new Error("Catálogo vazio");
      products = data.produtos;
      readURL();
      render(false);
      const initial = products.find(
        (p) => p.sku === new URLSearchParams(location.search).get("peca"),
      );
      if (initial) openProduct(initial);
    } catch {
      count.textContent = "Catálogo indisponível no momento.";
      document.querySelector("#empty").hidden = true;
      document.querySelector("#load-error").hidden = false;
    } finally {
      grid.setAttribute("aria-busy", "false");
      Object.values(fields).forEach((field) => {
        field.disabled = false;
      });
      fields.porte.disabled = type === "roupas" || type === "chapeus";
      document.querySelectorAll("[data-type]").forEach((button) => {
        button.disabled = !products.length;
      });
      document.querySelector("#retry").disabled = false;
    }
  }
  document.querySelector("#retry").addEventListener("click", load);
  load();
}
