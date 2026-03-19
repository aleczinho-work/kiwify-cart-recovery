const express = require('express');
const router = express.Router();
const config = require('../config');
const { parseWebhookPayload, mapEventType } = require('../services/kiwify');
const recovery = require('../services/recovery');

// Armazena último payload para debug (temporário)
let lastPayload = null;
let lastHeaders = null;

/**
 * GET /webhook/debug
 * Retorna o último payload recebido (temporário — remover após diagnóstico)
 */
router.get('/debug', (req, res) => {
  res.json({
    lastPayload,
    lastHeaders,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /webhook
 * Recebe eventos da Kiwify (carrinho abandonado, pix gerado, boleto gerado, compra aprovada)
 */
router.post('/', async (req, res) => {
  try {
    const payload = req.body;

    if (!payload) {
      return res.status(400).json({ error: 'Payload vazio' });
    }

    // Salva para debug
    lastPayload = payload;
    lastHeaders = req.headers;

    // Log do payload completo para diagnóstico
    console.log(`[Webhook] Payload COMPLETO:`, JSON.stringify(payload).substring(0, 2000));
    console.log(`[Webhook] Headers COMPLETOS:`, JSON.stringify(req.headers).substring(0, 500));
    console.log(`[Webhook] Campos do payload:`, Object.keys(payload).join(', '));

    // Validação do token da Kiwify (se configurado)
    const webhookSecret = config.kiwify.webhookSecret;
    if (webhookSecret) {
      // Kiwify pode enviar o token em diversos campos
      const payloadToken = payload.webhook_token || payload.token || payload.signature ||
                           payload.api_key || req.headers['x-webhook-token'] ||
                           req.headers['x-kiwify-token'] || req.headers['authorization'] ||
                           req.headers['x-kiwify-signature'] || '';

      console.log(`[Webhook] Token recebido: "${payloadToken}" (esperado: "${webhookSecret}")`);

      if (payloadToken !== webhookSecret && !payloadToken.includes(webhookSecret)) {
        console.warn(`[Webhook] Token inválido — aceitando mesmo assim para diagnóstico`);
        // TEMPORÁRIO: não rejeita, apenas loga o aviso
        // return res.status(401).json({ error: 'Token inválido' });
      } else {
        console.log('[Webhook] Token validado com sucesso');
      }
    }

    const data = parseWebhookPayload(payload);
    const eventType = mapEventType(data.event);

    console.log(`[Webhook] Evento recebido: ${data.event} → ${eventType}`);
    console.log(`[Webhook] Cliente: ${data.customer.name} | Tel: ${data.customer.phone}`);

    if (!data.customer.phone) {
      console.warn('[Webhook] Telefone não encontrado no payload, ignorando');
      return res.status(200).json({ status: 'ignored', reason: 'no_phone' });
    }

    switch (eventType) {
      case 'abandoned_cart':
        await recovery.startAbandonedCartRecovery(data.customer.phone, data.customer.name);
        break;

      case 'pix_generated':
        await recovery.startPixRecovery(data.customer.phone, data.customer.name);
        break;

      case 'boleto_generated':
        await recovery.startBoletoRecovery(data.customer.phone, data.customer.name);
        break;

      case 'purchase_approved':
        await recovery.handlePurchaseApproved(data.customer.phone, data.customer.name);
        break;

      default:
        console.log(`[Webhook] Evento não tratado: ${eventType}`);
    }

    res.status(200).json({ status: 'ok', event: eventType });
  } catch (err) {
    console.error('[Webhook] Erro ao processar:', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
