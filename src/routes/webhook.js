const express = require('express');
const router = express.Router();
const config = require('../config');
const { parseWebhookPayload, mapEventType } = require('../services/kiwify');
const recovery = require('../services/recovery');

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

    // Log do payload completo para diagnóstico
    console.log(`[Webhook] Payload recebido:`, JSON.stringify(payload).substring(0, 1000));

    // Validação do token da Kiwify (se configurado)
    const webhookSecret = config.kiwify.webhookSecret;
    if (webhookSecret) {
      // Kiwify pode enviar o token em diversos campos
      const payloadToken = payload.webhook_token || payload.token || payload.signature ||
                           payload.api_key || req.headers['x-webhook-token'] ||
                           req.headers['x-kiwify-token'] || req.headers['authorization'] || '';

      console.log(`[Webhook] Token recebido: "${payloadToken}" | Headers: ${JSON.stringify(req.headers).substring(0, 300)}`);

      if (payloadToken !== webhookSecret && !payloadToken.includes(webhookSecret)) {
        console.warn(`[Webhook] Token inválido: "${payloadToken}" (esperado: "${webhookSecret}")`);
        return res.status(401).json({ error: 'Token inválido' });
      }
      console.log('[Webhook] Token validado com sucesso');
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
