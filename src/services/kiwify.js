/**
 * Processa o payload de webhook da Kiwify e extrai dados relevantes
 * @param {object} payload - Body do webhook
 * @returns {object} Dados normalizados do evento
 */
function parseWebhookPayload(payload) {
  const event = payload.webhook_event || payload.event;

  const customer = payload.Customer || payload.customer || {};
  const order = payload.Order || payload.order || {};
  const product = payload.Product || payload.product || {};

  const name = customer.full_name || customer.name || 'Cliente';
  const email = customer.email || '';
  const phone = customer.mobile || customer.phone || '';

  const productName = product.name || '';
  const orderStatus = order.status || '';
  const orderId = order.order_id || order.id || '';
  const checkoutUrl = order.checkout_link || '';

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
    cart_abandoned: 'abandoned_cart',
    carrinho_abandonado: 'abandoned_cart',
    order_approved: 'purchase_approved',
    compra_aprovada: 'purchase_approved',
    pix_generated: 'pix_generated',
    pix_gerado: 'pix_generated',
    billet_generated: 'boleto_generated',
    boleto_gerado: 'boleto_generated',
    order_refused: 'purchase_refused',
    compra_recusada: 'purchase_refused',
    order_refunded: 'purchase_refunded',
    compra_reembolsada: 'purchase_refunded',
  };

  return eventMap[event] || event;
}

module.exports = { parseWebhookPayload, mapEventType, normalizePhone };
