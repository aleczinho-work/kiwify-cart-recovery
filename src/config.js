require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,

  kiwify: {
    webhookSecret: process.env.KIWIFY_WEBHOOK_SECRET,
  },

  evolution: {
    apiUrl: process.env.EVOLUTION_API_URL,
    apiKey: process.env.EVOLUTION_API_KEY,
    instance: process.env.EVOLUTION_INSTANCE,
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },

  product: {
    name: process.env.PRODUCT_NAME || 'Produto',
    description: process.env.PRODUCT_DESCRIPTION || '',
    price: process.env.PRODUCT_PRICE || '0',
    checkoutUrl: process.env.CHECKOUT_URL || '',
    guarantee: process.env.PRODUCT_GUARANTEE || '7 dias de garantia',
  },

  // Tempos de espera antes de enviar mensagens (em ms)
  delays: {
    abandonedCart: {
      first: 5 * 60 * 1000,        // 5 minutos
      second: 60 * 60 * 1000,      // 1 hora
      third: 24 * 60 * 60 * 1000,  // 24 horas
    },
    pix: {
      first: 15 * 60 * 1000,       // 15 minutos
      second: 2 * 60 * 60 * 1000,  // 2 horas
    },
    boleto: {
      first: 60 * 60 * 1000,       // 1 hora
      second: 24 * 60 * 60 * 1000, // 24 horas
      third: 48 * 60 * 60 * 1000,  // 48 horas
    },
  },
};

module.exports = config;
