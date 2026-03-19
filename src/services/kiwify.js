/**
 * Processa o payload de webhook da Kiwify e extrai dados relevantes
 * Suporta dois formatos:
 *   1. Formato Kiwify real: { signature, order: { webhook_event_type, Customer, Product, ... } }
 *   2. Formato legado/teste: { webhook_event, Customer, Product, ... }
 * @param {object} payload - Body do webhook
 * @returns {object} Dados normalizados do evento
 */
function parseWebhookPayload(payload) {
  // Formato Kiwify real: dados dentro de payload.order
  const orderData = payload.order || {};

  // Evento: payload.order.webhook_event_type (real) ou payload.webhook_event (teste)
  const event = orderData.webhook_event_type || payload.webhook_event_type ||
                payload.webhook_event || payload.event || '';

  // Customer: dentro de order (real) ou na raiz (teste)
  const customer = orderData.Customer || orderData.customer ||
                   payload.Customer || payload.customer || {};

  // Product: dentro de order (real) ou na raiz (teste)
  const product = orderData.Product || orderData.product ||
                  payload.Product || payload.product || {};

  const name = customer.full_name || customer.name || customer.first_name || 'Cliente';
  const email = customer.email || '';
  const phone = customer.mobile || customer.phone || '';

  const productName = product.product_name || product.name || '';
  const orderStatus = orderData.order_status || payload.order_status || '';
  const orderId = orderData.order_id || payload.order_id || '';
  const checkoutUrl = orderData.checkout_link || payload.checkout_link || '';

  console.log(`[Kiwify] Parsed — evento: ${event} | nome: ${name} | tel: ${phone} | produto: ${productName}`);

  return {
    event,
    customer: {
      name,
      email,
      phone: normalizePhone(phone),
    },
    product: {
      name: productName,
    },
    order: {
      id: orderId,
      status: orderStatus,
      checkoutUrl,
    },
    raw: payload,
  };
}

/**
 * Normaliza telefone para formato internacional (5511999999999)
 */
function normalizePhone(phone) {
  if (!phone) return '';
  let clean = phone.replace(/\D/g, '');
  // Se não começa com 55 (Brasil), adiciona
  if (clean.length <= 11 && !clean.startsWith('55')) {
    clean = '55' + clean;
  }
  return clean;
}

/**
 * Mapeia eventos da Kiwify para tipos internos
 */
function mapEventType(event) {
  const eventMap = {
    // Carrinho abandonado
    cart_abandoned: 'abandoned_cart',
    carrinho_abandonado: 'abandoned_cart',
    abandoned_cart: 'abandoned_cart',
    // Compra aprovada
    order_approved: 'purchase_approved',
    compra_aprovada: 'purchase_approved',
    purchase_approved: 'purchase_approved',
    // Pix gerado (Kiwify envia como "pix_created")
    pix_generated: 'pix_generated',
    pix_gerado: 'pix_generated',
    pix_created: 'pix_generated',
    // Boleto gerado (Kiwify envia como "billet_created")
    billet_generated: 'boleto_generated',
    boleto_gerado: 'boleto_generated',
    billet_created: 'boleto_generated',
    // Outros
    order_refused: 'purchase_refused',
    compra_recusada: 'purchase_refused',
    order_refunded: 'purchase_refunded',
    compra_reembolsada: 'purchase_refunded',
  };

  return eventMap[event] || event;
}

module.exports = { parseWebhookPayload, mapEventType, normalizePhone };
