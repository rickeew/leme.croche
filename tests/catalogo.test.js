import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { filterProducts, labels, money } from "../catalogo-core.js";
const { produtos } = JSON.parse(
  readFileSync(new URL("../produtos.json", import.meta.url), "utf8"),
);

test("47 peças únicas, preços válidos e uma foto local por produto", () => {
  assert.equal(produtos.length, 47);
  for (const field of ["id", "sku", "imagem", "original"])
    assert.equal(new Set(produtos.map((p) => p[field])).size, 47, field);
  for (const p of produtos) {
    assert.ok(p.nome && p.descricao);
    assert.ok(labels.tipo[p.tipo] && labels.cor[p.cor]);
    assert.ok(
      Number.isInteger(p.preco) && p.preco >= 80 && p.preco <= 300,
      p.sku,
    );
    assert.ok(existsSync(new URL("../" + p.imagem, import.meta.url)), p.imagem);
    assert.equal(p.precoSugerido, true);
    assert.equal(
      p.porteEstimado,
      p.tipo === "bolsas" || p.tipo === "acessorios",
    );
  }
});
test("busca encontra acentos, cor e referência sem depender de caixa", () => {
  assert.equal(
    filterProducts(produtos, { q: "LEME-033" })[0].nome,
    "Bolsa Caramelo Franjas",
  );
  assert.equal(filterProducts(produtos, { q: "chapeu" }).length, 2);
  assert.equal(
    filterProducts(produtos, { q: "CALCA BRANCA" })[0].sku,
    "LEME-015",
  );
  assert.ok(filterProducts(produtos, { q: "verde oliva" }).length > 0);
});
test("combina tipo, porte, cor e preço; nenhuma roupa recebe porte de bolsa", () => {
  const result = filterProducts(produtos, {
    tipo: "bolsas",
    porte: "pequeno",
    cor: "preto",
    preco: "230",
  });
  assert.deepEqual(
    result.map((p) => p.sku),
    ["LEME-009", "LEME-010", "LEME-035", "LEME-039"],
  );
  assert.ok(
    result.every(
      (p) =>
        p.tipo === "bolsas" &&
        p.porte === "pequeno" &&
        p.cor === "preto" &&
        p.preco > 150 &&
        p.preco <= 230,
    ),
  );
  assert.equal(filterProducts(produtos, { tipo: "roupas" }).length, 5);
  assert.equal(filterProducts(produtos, { q: "zzzzinexistente" }).length, 0);
});
test("faixas cobrem toda a coleção; preço aumenta conforme porte", () => {
  const bands = ["150", "230", "300"].map((preco) =>
    filterProducts(produtos, { preco }),
  );
  assert.equal(bands.flat().length, 47);
  assert.equal(new Set(bands.flat().map((p) => p.sku)).size, 47);
  const small = produtos.filter(
      (p) => p.tipo === "bolsas" && p.porte === "pequeno",
    ),
    medium = produtos.filter((p) => p.tipo === "bolsas" && p.porte === "medio"),
    large = produtos.filter((p) => p.tipo === "bolsas" && p.porte === "grande");
  assert.ok(
    Math.max(...small.map((p) => p.preco)) <
      Math.min(...medium.map((p) => p.preco)),
  );
  assert.ok(
    Math.max(...medium.map((p) => p.preco)) <
      Math.min(...large.map((p) => p.preco)),
  );
});
test("ordenação não altera a coleção original", () => {
  const ids = produtos.map((p) => p.sku),
    asc = filterProducts(produtos, { ordem: "menor" }),
    desc = filterProducts(produtos, { ordem: "maior" });
  assert.equal(asc[0].preco, 80);
  assert.equal(desc[0].preco, 300);
  assert.ok(asc.every((p, i) => !i || asc[i - 1].preco <= p.preco));
  assert.ok(desc.every((p, i) => !i || desc[i - 1].preco >= p.preco));
  assert.deepEqual(
    produtos.map((p) => p.sku),
    ids,
  );
  assert.match(money(80), /80,00/);
});
test("recursos e links locais das duas páginas existem", () => {
  for (const page of ["index.html", "catalogo.html"]) {
    const html = readFileSync(new URL("../" + page, import.meta.url), "utf8");
    for (const [, path] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
      if (/^https?:/.test(path)) continue;
      assert.ok(
        existsSync(new URL("../" + path.split(/[?#]/)[0], import.meta.url)),
        `${page}: ${path}`,
      );
    }
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  }
});
