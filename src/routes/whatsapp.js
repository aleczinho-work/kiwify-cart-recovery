const express = require('express');
const router = express.Router();
const store = require('../data/store');
const claude = require('../services/claude');
const whatsapp = require('../services/whatsapp');
const messages = require('../templates/messages');

/**
 * POST /whatsapp/webhook
 * Recebe mensagens dos clientes via Evolution API
 */
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Evolution API envia diferentes tipos de evento
    // Filtra apenas mensagens de texto recebidas
    if (!body || body.event !== 'messages.upsert') {
      return res.status(200).json({ status: 'ignored' });
    }

    const message = body.data;
    if (!message || message.key?.fromMe) {
      return res.status(200).json({ status: 'ignored' });
    }

    const phone = message.key?.remoteJid?.replace('@s.whatsapp.net', '') || '';
    const text = message.message?.conversation ||
                 message.message?.extendedTextMessage?.text || '';

    if (!phone || !text) {
      return res.status(200).json({ status: 'ignored' });
    }

    console.log(`[WhatsApp In] Mensagem de ${phone}: ${text}`);

    // Busca dados do lead
    const lead = store.getLead(phone);
    const customerName = lead?.name || 'Cliente';

    // Monta contexto para a IA
    let context = '';
    if (lead) {
      context = `Este cliente ${lead.type === 'abandoned_cart' ? 'abandonou o carrinho' :
        lead.type === 'pix_generated' ? 'gerou um Pix mas não pagou' :
        lead.type === 'boleto_generated' ? 'gerou um boleto mas não pagou' :
        'está em contato'}. Status: ${lead.status}`;
    }

    // Gera resposta com Claude
    const response = await claude.answerQuestion(customerName, text, context);

    if (response.needsHandoff) {
      // IA não soube responder — escala para humano
      console.log(`[WhatsApp] Handoff para humano — ${phone}`);
      await whatsapp.sendMessage(phone, messages.humanHandoff(customerName));
      store.upsertLead(phone, { needsHumanAttention: true });
    } else {
      await whatsapp.sendMessage(phone, response.text);
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[WhatsApp Route] Erro:', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
