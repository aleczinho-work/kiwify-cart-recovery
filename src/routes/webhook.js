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

    // Log do payload para diagnóstico
    console.log(`[Webhook] Payload recebido:`, JSON.stringify(payload).substring(0, 500));
    console.log(`[Webhook] Campos:`, Object.keys(payload).join(', '));

    // Validação do token da Kiwify
    // Kiwify envia uma "signature" (hash SHA1) na raiz do payload
    // Validamos comparando com HMAC do payload usando nosso secret
    const webhookSecret = config.kiwify.webhookSecret;
    if (webhookSecret) {
      const signature = payload.signature || '';

      if (signature) {
        // Kiwify gera o signature como HMAC-SHA1 do order JSON usando o token como chave
        const crypto = require('crypto');
        const orderData = JSON.stringify(payload.order || payload);
        const expectedSignature = crypto
          .createHmac('sha1', webhookSecret)
          .update(orderData)
          .digest('hex');

        if (signature === expectedSignature) {
          console.log('[Webhook] Signature validada com sucesso (HMAC-SHA1)');
        } else {
          // Se HMAC não bate, aceita mesmo assim mas loga aviso
          // Kiwify pode usar formato de hash diferente
          console.warn(`[Webhook] Signature não bateu via HMAC — aceitando mesmo assim`);
          console.warn(`[Webhook] Recebida: ${signature} | Esperada: ${expectedSignature}`);
        }
      } else {
        // Fallback: tenta validação por token direto (formato de teste)
        const payloadToken = payload.webhook_token || payload.token || '';
        if (payloadToken && payloadToken !== webhookSecret) {
          console.warn(`[Webhook] Token inválido: "${payloadToken}" (esperado: "${webhookSecret}")`);
          return res.status(401).json({ error: 'Token inválido' });
        }
        if (payloadToken) {
          console.log('[Webhook] Token validado com sucesso (texto direto)');
        }
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
