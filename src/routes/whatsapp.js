const express = require('express');
const router = express.Router();
const store = require('../data/store');
const autoResponder = require('../services/autoResponder');
const claude = require('../services/claude');
const whatsapp = require('../services/whatsapp');
const messages = require('../templates/messages');

/**
 * POST /whatsapp/webhook
 * Recebe mensagens dos clientes via Z-API
 * Sistema híbrido: tenta resposta automática primeiro, depois Claude API
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

    // Detecta se é áudio (Z-API envia em vários formatos)
    const isAudio = !!(body.audio || body.ptt || body.type === 'audio' || body.type === 'ptt' ||
                       body.messageType === 'audio' || body.messageType === 'ptt' ||
                       body.isAudio || body.audioMessage || body.pttMessage);

    // Detecta se é imagem ou documento (comprovante de pagamento)
    const isImage = !!(body.image || body.type === 'image' || body.messageType === 'image' ||
                       body.isImage || body.imageMessage);
    const isDocument = !!(body.document || body.type === 'document' || body.messageType === 'document' ||
                         body.isDocument || body.documentMessage);
    const isMedia = isImage || isDocument;

    if (!phone || (!text && !isAudio && !isMedia)) {
      return res.status(200).json({ status: 'ignored' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const mediaType = isAudio ? 'ÁUDIO' : isImage ? 'IMAGEM' : isDocument ? 'DOCUMENTO' : 'Mensagem';
    console.log(`[WhatsApp In] ${mediaType} de ${cleanPhone}: ${text || `[${mediaType.toLowerCase()}]`}`);

    // 🚫 BLOQUEIO: Se já foi feito handoff, não responde mais NADA
    if (await store.isBlocked(cleanPhone)) {
      console.log(`[WhatsApp] ${cleanPhone} está BLOQUEADO (handoff já realizado) — ignorando mensagem`);
      return res.status(200).json({ status: 'ignored', reason: 'blocked' });
    }

    // Busca dados do lead
    const lead = await store.getLead(cleanPhone);
    const customerName = lead?.name || body.senderName || 'Cliente';

    // 🎤 Se for áudio, responde pedindo texto
    if (isAudio) {
      const audioResponse = autoResponder.getAudioResponse(customerName);
      console.log(`[WhatsApp] Resposta automática (audio) para ${cleanPhone}`);
      await whatsapp.sendMessage(cleanPhone, audioResponse.text);
      return res.status(200).json({ status: 'ok', source: 'auto_audio' });
    }

    // 📎 Se for imagem ou documento (comprovante de pagamento)
    if (isMedia) {
      console.log(`[WhatsApp] Comprovante recebido (${mediaType}) de ${cleanPhone}`);
      const comprovanteResponse =
        `Recebemos seu comprovante! 🙏\n\n` +
        `Vou verificar o pagamento e assim que for confirmado, seu acesso ao *Identidade Desbloqueada* será liberado.\n\n` +
        `Isso pode levar alguns minutinhos. Obrigado pela paciência!`;
      await whatsapp.sendMessage(cleanPhone, comprovanteResponse);
      return res.status(200).json({ status: 'ok', source: 'auto_comprovante' });
    }

    // 1️⃣ PRIMEIRO: Tenta resposta automática por palavras-chave (custo zero)
    const autoResponse = autoResponder.getAutoResponse(customerName, text);

    if (autoResponse.matched) {
      console.log(`[WhatsApp] Resposta automática (${autoResponse.matchedId}) para ${cleanPhone}`);

      // Se a resposta pede envio de imagem (ex: saudação), envia com capa do livro
      if (autoResponse.sendImage && autoResponder.coverImageUrl) {
        await whatsapp.sendImage(cleanPhone, autoResponder.coverImageUrl, autoResponse.text);
      } else {
        await whatsapp.sendMessage(cleanPhone, autoResponse.text);
      }

      return res.status(200).json({ status: 'ok', source: 'auto' });
    }

    // 2️⃣ SEGUNDO: Se não encontrou, usa Claude API (custo por uso)
    console.log(`[WhatsApp] Nenhuma resposta automática — usando Claude API para ${cleanPhone}`);

    // Monta contexto para a IA
    let context = '';
    if (lead) {
      context = `Este cliente ${lead.type === 'abandoned_cart' ? 'abandonou o carrinho' :
        lead.type === 'pix_generated' ? 'gerou um Pix mas não pagou' :
        lead.type === 'boleto_generated' ? 'gerou um boleto mas não pagou' :
        'está em contato'}. Status: ${lead.status}`;
    }

    const response = await claude.answerQuestion(customerName, text, context);

    if (response.needsHandoff) {
      console.log(`[WhatsApp] Handoff para humano — ${cleanPhone} — BLOQUEANDO futuras mensagens`);
      await whatsapp.sendMessage(cleanPhone, messages.humanHandoff(customerName));
      await store.upsertLead(cleanPhone, { needsHumanAttention: true });
      // 🔒 Bloqueia permanentemente — não envia mais mensagens automáticas
      await store.markBlocked(cleanPhone);
    } else {
      await whatsapp.sendMessage(cleanPhone, response.text);
    }

    res.status(200).json({ status: 'ok', source: response.needsHandoff ? 'handoff_blocked' : 'claude' });
  } catch (err) {
    console.error('[WhatsApp Route] Erro:', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
