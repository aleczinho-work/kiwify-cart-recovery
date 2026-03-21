// Armazenamento persistente com Upstash Redis
// Dados sobrevivem a deploys e cold starts da Vercel
const { Redis } = require('@upstash/redis');

let redis = null;

function getRedis() {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.warn('[Store] Redis não configurado — usando fallback em memória');
      return null;
    }

    redis = new Redis({ url, token });
  }
  return redis;
}

// Fallback em memória (caso Redis não esteja configurado)
const memoryLeads = {};

const store = {
  /**
   * Salva ou atualiza um lead
   */
  async upsertLead(phone, data) {
    const r = getRedis();
    if (r) {
      try {
        const existing = await r.get(`lead:${phone}`) || {};
        const updated = {
          ...existing,
          ...data,
          phone,
          updatedAt: new Date().toISOString(),
          createdAt: existing.createdAt || new Date().toISOString(),
        };
        // TTL de 60 dias — após isso o lead expira automaticamente
        await r.set(`lead:${phone}`, updated, { ex: 60 * 24 * 60 * 60 });
        return updated;
      } catch (err) {
        console.error('[Store] Erro Redis upsertLead:', err.message);
      }
    }
    // Fallback memória
    const existing = memoryLeads[phone] || {};
    memoryLeads[phone] = {
      ...existing,
      ...data,
      phone,
      updatedAt: new Date().toISOString(),
      createdAt: existing.createdAt || new Date().toISOString(),
    };
    return memoryLeads[phone];
  },

  /**
   * Busca um lead pelo telefone
   */
  async getLead(phone) {
    const r = getRedis();
    if (r) {
      try {
        return await r.get(`lead:${phone}`) || null;
      } catch (err) {
        console.error('[Store] Erro Redis getLead:', err.message);
      }
    }
    return memoryLeads[phone] || null;
  },

  /**
   * Marca lead como convertido (comprou)
   */
  async markConverted(phone) {
    const r = getRedis();
    if (r) {
      try {
        const existing = await r.get(`lead:${phone}`) || {};
        existing.status = 'converted';
        existing.convertedAt = new Date().toISOString();
        existing.phone = phone;
        await r.set(`lead:${phone}`, existing, { ex: 60 * 24 * 60 * 60 });
        // Marca também numa chave rápida para consulta eficiente
        await r.set(`converted:${phone}`, true, { ex: 60 * 24 * 60 * 60 });
        return;
      } catch (err) {
        console.error('[Store] Erro Redis markConverted:', err.message);
      }
    }
    if (memoryLeads[phone]) {
      memoryLeads[phone].status = 'converted';
      memoryLeads[phone].convertedAt = new Date().toISOString();
    }
  },

  /**
   * Verifica se o lead já converteu (para não enviar mais mensagens)
   */
  async isConverted(phone) {
    const r = getRedis();
    if (r) {
      try {
        // Primeiro tenta a chave rápida
        const quick = await r.get(`converted:${phone}`);
        if (quick) return true;
        // Fallback: verifica o lead completo
        const lead = await r.get(`lead:${phone}`);
        return lead?.status === 'converted';
      } catch (err) {
        console.error('[Store] Erro Redis isConverted:', err.message);
      }
    }
    return memoryLeads[phone]?.status === 'converted';
  },

  /**
   * Registra mensagem enviada
   */
  async logMessage(phone, type, step) {
    const r = getRedis();
    if (r) {
      try {
        const existing = await r.get(`lead:${phone}`);
        if (!existing) return;
        if (!existing.messages) existing.messages = [];
        existing.messages.push({ type, step, sentAt: new Date().toISOString() });
        await r.set(`lead:${phone}`, existing, { ex: 60 * 24 * 60 * 60 });
        return;
      } catch (err) {
        console.error('[Store] Erro Redis logMessage:', err.message);
      }
    }
    if (!memoryLeads[phone]) return;
    if (!memoryLeads[phone].messages) memoryLeads[phone].messages = [];
    memoryLeads[phone].messages.push({ type, step, sentAt: new Date().toISOString() });
  },

  /**
   * Marca lead como bloqueado (não recebe mais mensagens automáticas)
   */
  async markBlocked(phone) {
    const r = getRedis();
    if (r) {
      try {
        const existing = await r.get(`lead:${phone}`) || { phone, createdAt: new Date().toISOString() };
        existing.blocked = true;
        existing.blockedAt = new Date().toISOString();
        await r.set(`lead:${phone}`, existing, { ex: 60 * 24 * 60 * 60 });
        // Chave rápida para consulta
        await r.set(`blocked:${phone}`, true, { ex: 60 * 24 * 60 * 60 });
        return;
      } catch (err) {
        console.error('[Store] Erro Redis markBlocked:', err.message);
      }
    }
    if (!memoryLeads[phone]) {
      memoryLeads[phone] = { phone, createdAt: new Date().toISOString() };
    }
    memoryLeads[phone].blocked = true;
    memoryLeads[phone].blockedAt = new Date().toISOString();
  },

  /**
   * Verifica se o lead está bloqueado (handoff já realizado)
   */
  async isBlocked(phone) {
    const r = getRedis();
    if (r) {
      try {
        const quick = await r.get(`blocked:${phone}`);
        if (quick) return true;
        const lead = await r.get(`lead:${phone}`);
        return lead?.blocked === true;
      } catch (err) {
        console.error('[Store] Erro Redis isBlocked:', err.message);
      }
    }
    return memoryLeads[phone]?.blocked === true;
  },

  /**
   * Retorna todos os leads (apenas memória — Redis não suporta getAll eficiente)
   */
  getAllLeads() {
    return { ...memoryLeads };
  },
};

module.exports = store;
