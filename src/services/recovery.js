const config = require('../config');
const store = require('../data/store');
const whatsapp = require('./whatsapp');
const messages = require('../templates/messages');

// Armazena timeouts ativos para poder cancelá-los
const activeTimers = new Map();

/**
 * Cancela todos os timers de um lead (quando ele converte)
 */
function cancelTimers(phone) {
  const timers = activeTimers.get(phone);
  if (timers) {
    timers.forEach((timer) => clearTimeout(timer));
    activeTimers.delete(phone);
    console.log(`[Recovery] Timers cancelados para ${phone}`);
  }
}

/**
 * Agenda uma mensagem para ser enviada após um delay
 */
function scheduleMessage(phone, name, type, step, delay, getMessage) {
  const timer = setTimeout(async () => {
    // Verifica se o lead já converteu antes de enviar
    if (store.isConverted(phone)) {
      console.log(`[Recovery] ${phone} já converteu, pulando ${type} step ${step}`);
      return;
    }

    try {
      const text = getMessage(name);
      await whatsapp.sendMessage(phone, text);
      store.logMessage(phone, type, step);
      console.log(`[Recovery] ${type} step ${step} enviada para ${phone}`);
    } catch (err) {
      console.error(`[Recovery] Erro ao enviar ${type} step ${step} para ${phone}:`, err.message);
    }
  }, delay);

  // Salva o timer para poder cancelar depois
  if (!activeTimers.has(phone)) {
    activeTimers.set(phone, []);
  }
  activeTimers.get(phone).push(timer);
}

/**
 * Inicia sequência de recuperação de carrinho abandonado
 */
function startAbandonedCartRecovery(phone, name) {
  console.log(`[Recovery] Iniciando recuperação de carrinho para ${name} (${phone})`);

  const delays = config.delays.abandonedCart;

  store.upsertLead(phone, { name, type: 'abandoned_cart', status: 'recovering' });

  scheduleMessage(phone, name, 'abandoned_cart', 1, delays.first, messages.abandonedCart.first);
  scheduleMessage(phone, name, 'abandoned_cart', 2, delays.second, messages.abandonedCart.second);
  scheduleMessage(phone, name, 'abandoned_cart', 3, delays.third, messages.abandonedCart.third);
}

/**
 * Inicia sequência de remarketing para Pix gerado
 */
function startPixRecovery(phone, name) {
  console.log(`[Recovery] Iniciando remarketing Pix para ${name} (${phone})`);

  const delays = config.delays.pix;

  store.upsertLead(phone, { name, type: 'pix_generated', status: 'recovering' });

  scheduleMessage(phone, name, 'pix', 1, delays.first, messages.pix.first);
  scheduleMessage(phone, name, 'pix', 2, delays.second, messages.pix.second);
}

/**
 * Inicia sequência de remarketing para boleto gerado
 */
function startBoletoRecovery(phone, name) {
  console.log(`[Recovery] Iniciando remarketing boleto para ${name} (${phone})`);

  const delays = config.delays.boleto;

  store.upsertLead(phone, { name, type: 'boleto_generated', status: 'recovering' });

  scheduleMessage(phone, name, 'boleto', 1, delays.first, messages.boleto.first);
  scheduleMessage(phone, name, 'boleto', 2, delays.second, messages.boleto.second);
  scheduleMessage(phone, name, 'boleto', 3, delays.third, messages.boleto.third);
}

/**
 * Processa uma compra aprovada — cancela timers e notifica cliente
 */
async function handlePurchaseApproved(phone, name) {
  console.log(`[Recovery] Compra aprovada para ${name} (${phone})`);

  cancelTimers(phone);
  store.markConverted(phone);

  try {
    await whatsapp.sendMessage(phone, messages.purchaseApproved(name));
  } catch (err) {
    console.error(`[Recovery] Erro ao enviar confirmação para ${phone}:`, err.message);
  }
}

module.exports = {
  startAbandonedCartRecovery,
  startPixRecovery,
  startBoletoRecovery,
  handlePurchaseApproved,
  cancelTimers,
};
