const { Client } = require('@upstash/qstash');
const config = require('../config');
const store = require('../data/store');
const whatsapp = require('./whatsapp');
const messages = require('../templates/messages');

const qstash = new Client({ token: config.qstash.token, baseUrl: config.qstash.url });

const BASE_URL = config.qstash.callbackUrl;

/**
 * Agenda uma mensagem via QStash para ser enviada após um delay
 */
async function scheduleMessage(phone, name, type, step, delaySec) {
  try {
    await qstash.publishJSON({
      url: `${BASE_URL}/scheduled/send`,
      body: { phone, name, type, step },
      delay: delaySec,
    });
    console.log(`[Recovery] Agendado ${type} step ${step} para ${phone} em ${delaySec}s`);
  } catch (err) {
    console.error(`[Recovery] Erro ao agendar ${type} step ${step}:`, err.message);
  }
}

/**
 * Processa callback do QStash — envia a mensagem agendada
 */
async function processScheduledMessage({ phone, name, type, step }) {
  if (store.isConverted(phone)) {
    console.log(`[Recovery] ${phone} já converteu, pulando ${type} step ${step}`);
    return;
  }

  const templateMap = {
    'abandoned_cart': messages.abandonedCart,
    'pix': messages.pix,
    'boleto': messages.boleto,
  };

  const stepMap = { 1: 'first', 2: 'second', 3: 'third' };
  const template = templateMap[type];
  const stepKey = stepMap[step];

  if (!template || !template[stepKey]) {
    console.error(`[Recovery] Template não encontrado: ${type} ${stepKey}`);
    return;
  }

  try {
    const text = template[stepKey](name);
    const coverUrl = config.product.coverImageUrl;

    // Envia imagem com legenda na primeira mensagem, texto simples nas demais
    if (step === 1 && coverUrl) {
      await whatsapp.sendImage(phone, coverUrl, text);
    } else {
      await whatsapp.sendMessage(phone, text);
    }

    store.logMessage(phone, type, step);
    console.log(`[Recovery] ${type} step ${step} enviada para ${phone}`);
  } catch (err) {
    console.error(`[Recovery] Erro ao enviar ${type} step ${step} para ${phone}:`, err.message);
  }
}

/**
 * Inicia sequência de recuperação de carrinho abandonado
 */
async function startAbandonedCartRecovery(phone, name) {
  console.log(`[Recovery] Iniciando recuperação de carrinho para ${name} (${phone})`);

  store.upsertLead(phone, { name, type: 'abandoned_cart', status: 'recovering' });

  const delays = config.delays.abandonedCart;
  await scheduleMessage(phone, name, 'abandoned_cart', 1, Math.floor(delays.first / 1000));
  await scheduleMessage(phone, name, 'abandoned_cart', 2, Math.floor(delays.second / 1000));
  await scheduleMessage(phone, name, 'abandoned_cart', 3, Math.floor(delays.third / 1000));
}

/**
 * Inicia sequência de remarketing para Pix gerado
 */
async function startPixRecovery(phone, name) {
  console.log(`[Recovery] Iniciando remarketing Pix para ${name} (${phone})`);

  store.upsertLead(phone, { name, type: 'pix_generated', status: 'recovering' });

  const delays = config.delays.pix;
  await scheduleMessage(phone, name, 'pix', 1, Math.floor(delays.first / 1000));
  await scheduleMessage(phone, name, 'pix', 2, Math.floor(delays.second / 1000));
}

/**
 * Inicia sequência de remarketing para boleto gerado
 */
async function startBoletoRecovery(phone, name) {
  console.log(`[Recovery] Iniciando remarketing boleto para ${name} (${phone})`);

  store.upsertLead(phone, { name, type: 'boleto_generated', status: 'recovering' });

  const delays = config.delays.boleto;
  await scheduleMessage(phone, name, 'boleto', 1, Math.floor(delays.first / 1000));
  await scheduleMessage(phone, name, 'boleto', 2, Math.floor(delays.second / 1000));
  await scheduleMessage(phone, name, 'boleto', 3, Math.floor(delays.third / 1000));
}

/**
 * Processa uma compra aprovada — notifica cliente
 */
async function handlePurchaseApproved(phone, name) {
  console.log(`[Recovery] Compra aprovada para ${name} (${phone})`);

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
  processScheduledMessage,
};
