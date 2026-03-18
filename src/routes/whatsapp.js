const express = require('express');
const router = express.Router();
const store = require('../data/store');
const claude = require('../services/claude');
const whatsapp = require('../services/whatsapp');
const messages = require('../templates/messages');

/**
 * POST /whatsapp/webhook
 * Recebe mensagens dos clientes via Z-API
 */
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    if (!body) {
      return res.status(200).json({ status: 'ignored' });
    }

    // Z-API envia mensagens recebidas com fromMe: false
    if (body.fromMe) {
      return res.status(200).json({ status: 'ignored' });
    }

    // Extrai dados no formato Z-API
    const phone = body.phone || '';
    const text = body.text?.message || body.text || '';

    if (!phone || !text) {
      return res.status(200).json({ status: 'ignored' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    console.log(`[WhatsApp In] Mensagem de ${cleanPhone}: ${text}`);

    // Busca dados do lead
    const lead = store.getLead(cleanPhone);
    const customerName = lead?.name || body.senderName || 'Cliente';

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
      console.log(`[WhatsApp] Handoff para humano — ${cleanPhone}`);
      await whatsapp.sendMessage(cleanPhone, messages.humanHandoff(customerName));
      store.upsertLead(cleanPhone, { needsHumanAttention: true });
    } else {
      await whatsapp.sendMessage(cleanPhone, response.text);
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[WhatsApp Route] Erro:', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
