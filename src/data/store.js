const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'leads.json');

function loadLeads() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('[Store] Erro ao carregar leads:', err.message);
  }
  return {};
}

function saveLeads(leads) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2), 'utf-8');
}

const leads = loadLeads();

const store = {
  /**
   * Salva ou atualiza um lead
   * @param {string} phone - Telefone do lead (chave)
   * @param {object} data - Dados do lead
   */
  upsertLead(phone, data) {
    const existing = leads[phone] || {};
    leads[phone] = {
      ...existing,
      ...data,
      phone,
      updatedAt: new Date().toISOString(),
      createdAt: existing.createdAt || new Date().toISOString(),
    };
    saveLeads(leads);
    return leads[phone];
  },

  /**
   * Busca um lead pelo telefone
   */
  getLead(phone) {
    return leads[phone] || null;
  },

  /**
   * Marca lead como convertido (comprou)
   */
  markConverted(phone) {
    if (leads[phone]) {
      leads[phone].status = 'converted';
      leads[phone].convertedAt = new Date().toISOString();
      saveLeads(leads);
    }
  },

  /**
   * Verifica se o lead já converteu (para não enviar mais mensagens)
   */
  isConverted(phone) {
    return leads[phone]?.status === 'converted';
  },

  /**
   * Registra mensagem enviada
   */
  logMessage(phone, type, step) {
    if (!leads[phone]) return;
    if (!leads[phone].messages) leads[phone].messages = [];
    leads[phone].messages.push({
      type,
      step,
      sentAt: new Date().toISOString(),
    });
    saveLeads(leads);
  },

  /**
   * Retorna todos os leads
   */
  getAllLeads() {
    return { ...leads };
  },
};

module.exports = store;
