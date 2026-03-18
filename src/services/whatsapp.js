const axios = require('axios');
const config = require('../config');

const { apiUrl, apiKey, instance } = config.evolution;

const api = axios.create({
  baseURL: `${apiUrl}`,
  headers: {
    'Content-Type': 'application/json',
    apikey: apiKey,
  },
});

/**
 * Envia uma mensagem de texto via Evolution API
 * @param {string} phone - Número do telefone (ex: 5511999999999)
 * @param {string} text - Texto da mensagem
 */
async function sendMessage(phone, text) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');

    const response = await api.post(`/message/sendText/${instance}`, {
      number: cleanPhone,
      text,
    });

    console.log(`[WhatsApp] Mensagem enviada para ${cleanPhone}`);
    return response.data;
  } catch (err) {
    console.error(`[WhatsApp] Erro ao enviar para ${phone}:`, err.response?.data || err.message);
    throw err;
  }
}

/**
 * Verifica se a instância do WhatsApp está conectada
 */
async function checkConnection() {
  try {
    const response = await api.get(`/instance/connectionState/${instance}`);
    return response.data;
  } catch (err) {
    console.error('[WhatsApp] Erro ao verificar conexão:', err.message);
    return null;
  }
}

module.exports = { sendMessage, checkConnection };
