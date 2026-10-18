import test from "node:test";
import assert from "node:assert/strict";
import {
  copyAndOpenInstagram,
  productMessage,
  INSTAGRAM_URL,
} from "../instagram-contact.js";

const product = { nome: "Bolsa Caramelo Franjas", sku: "LEME-033", preco: 170 };

test("mensagem identifica a peça e seu preço em reais", () => {
  const message = productMessage(product);
  assert.ok(message.includes(product.nome));
  assert.ok(message.includes(product.sku));
  assert.match(message, /R\$\s170,00/);
});

test("abre aba no clique e só navega ao Instagram depois de copiar", async () => {
  let resolveCopy, copiedText, navigatedTo;
  const copying = new Promise((resolve) => {
    resolveCopy = resolve;
  });
  const popup = {
    opener: {},
    closed: false,
    location: {
      replace: (url) => {
        navigatedTo = url;
      },
    },
  };
  let opened = false;
  const pending = copyAndOpenInstagram(product, {
    clipboard: {
      writeText: (text) => {
        copiedText = text;
        return copying;
      },
    },
    openWindow: () => {
      opened = true;
      return popup;
    },
  });
  assert.equal(opened, true);
  assert.equal(popup.opener, null);
  assert.equal(navigatedTo, undefined);
  resolveCopy();
  const result = await pending;
  assert.equal(navigatedTo, INSTAGRAM_URL);
  assert.equal(copiedText, productMessage(product));
  assert.equal(result.copied, true);
  assert.equal(result.opened, true);
});

test("cópia negada fecha a aba vazia e mantém a mensagem completa como alternativa", async () => {
  let closed = false,
    navigated = false;
  const result = await copyAndOpenInstagram(product, {
    clipboard: { writeText: () => Promise.reject(new Error("denied")) },
    openWindow: () => ({
      close: () => {
        closed = true;
      },
      location: {
        replace: () => {
          navigated = true;
        },
      },
    }),
  });
  assert.equal(closed, true);
  assert.equal(navigated, false);
  assert.equal(result.copied, false);
  assert.equal(result.message, productMessage(product));
});

test("aba bloqueada preserva a cópia; navegador sem clipboard oferece alternativa", async () => {
  const blocked = await copyAndOpenInstagram(product, {
    clipboard: { writeText: async () => {} },
    openWindow: () => null,
  });
  assert.equal(blocked.copied, true);
  assert.equal(blocked.opened, false);
  const unsupported = await copyAndOpenInstagram(product, {
    clipboard: undefined,
    openWindow: () => {
      throw new Error("não deve abrir");
    },
  });
  assert.equal(unsupported.copied, false);
  assert.equal(unsupported.message, productMessage(product));
});
