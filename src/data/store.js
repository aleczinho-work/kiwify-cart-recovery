// Armazenamento em memória (compatível com Vercel serverless)
const leads = {};

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
  },

  /**
   * Marca lead como bloqueado (não recebe mais mensagens automáticas)
   * Usado após handoff para atendimento humano
   */
  markBlocked(phone) {
    if (!leads[phone]) {
      leads[phone] = { phone, createdAt: new Date().toISOString() };
    }
    leads[phone].blocked = true;
    leads[phone].blockedAt = new Date().toISOString();
  },

  /**
   * Verifica se o lead está bloqueado (handoff já realizado)
   */
  isBlocked(phone) {
    return leads[phone]?.blocked === true;
  },

  /**
   * Retorna todos os leads
   */
  getAllLeads() {
    return { ...leads };
  },
};

module.exports = store;
