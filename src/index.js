const express = require('express');
const config = require('./config');
const webhookRoutes = require('./routes/webhook');
const whatsappRoutes = require('./routes/whatsapp');
const { checkConnection } = require('./services/whatsapp');
const store = require('./data/store');

const app = express();

// Middleware
app.use(express.json());

// Rotas
app.use('/webhook', webhookRoutes);         // Kiwify envia webhooks aqui
app.use('/whatsapp', whatsappRoutes);       // Evolution API envia mensagens recebidas aqui

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Kiwify Cart Recovery Agent',
    timestamp: new Date().toISOString(),
  });
});

// Dashboard simples — lista leads
app.get('/leads', (req, res) => {
  const leads = store.getAllLeads();
  const total = Object.keys(leads).length;
  const converted = Object.values(leads).filter((l) => l.status === 'converted').length;
  const recovering = Object.values(leads).filter((l) => l.status === 'recovering').length;

  res.json({
    total,
    converted,
    recovering,
    conversionRate: total > 0 ? `${((converted / total) * 100).toFixed(1)}%` : '0%',
    leads,
  });
});

// Inicia o servidor
app.listen(config.port, async () => {
  console.log('='.repeat(50));
  console.log('  Kiwify Cart Recovery Agent');
  console.log('='.repeat(50));
  console.log(`  Servidor rodando na porta ${config.port}`);
  console.log(`  Produto: ${config.product.name}`);
  console.log(`  Preço: R$ ${config.product.price}`);
  console.log('');
  console.log('  Endpoints:');
  console.log(`  POST /webhook          → Webhooks Kiwify`);
  console.log(`  POST /whatsapp/webhook → Mensagens WhatsApp`);
  console.log(`  GET  /leads            → Dashboard de leads`);
  console.log(`  GET  /                 → Health check`);
  console.log('='.repeat(50));

  // Verifica conexão WhatsApp
  const conn = await checkConnection();
  if (conn) {
    console.log(`  WhatsApp: ${JSON.stringify(conn)}`);
  } else {
    console.log('  WhatsApp: Nao foi possivel verificar conexao');
    console.log('  Configure EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE no .env');
  }
  console.log('='.repeat(50));
});

// Export para Vercel
module.exports = app;
