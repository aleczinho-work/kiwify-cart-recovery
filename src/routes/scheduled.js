const express = require('express');
const router = express.Router();
const { processScheduledMessage } = require('../services/recovery');

/**
 * POST /scheduled/send
 * Recebe callbacks do QStash para enviar mensagens agendadas
 */
router.post('/send', async (req, res) => {
  try {
    const { phone, name, type, step } = req.body;

    if (!phone || !type || !step) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    console.log(`[Scheduled] Processando ${type} step ${step} para ${phone}`);
    await processScheduledMessage({ phone, name, type, step });

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[Scheduled] Erro:', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
