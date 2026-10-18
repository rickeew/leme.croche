import { money } from "./catalogo-core.js";

export const INSTAGRAM_URL = "https://ig.me/m/leme.croche";

export function productMessage(product) {
  return `Olá! Gostei da ${product.nome} (${product.sku}), com preço de referência de ${money(product.preco)}. Pode me informar as medidas, a disponibilidade e o valor final?`;
}

export async function copyAndOpenInstagram(product, { clipboard, openWindow }) {
  const message = productMessage(product);
  if (!clipboard?.writeText) return { copied: false, opened: false, message };

  let popup = null;
  try {
    // Start clipboard access and open the tab during the original click gesture.
    // Waiting for the clipboard first can make mobile browsers block the tab.
    const copying = clipboard.writeText(message);
    try {
      popup = openWindow();
      if (popup) popup.opener = null;
    } catch {
      popup?.close();
      popup = null;
    }
    await copying;
  } catch {
    popup?.close();
    return { copied: false, opened: false, message };
  }

  try {
    if (popup && !popup.closed) {
      popup.location.replace(INSTAGRAM_URL);
      return { copied: true, opened: true, message };
    }
  } catch {
    popup?.close();
  }
  return { copied: true, opened: false, message };
}
