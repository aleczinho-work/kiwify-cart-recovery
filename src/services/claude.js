const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

const SYSTEM_PROMPT = `Você é o assistente do autor Álec Guímel, responsável por tirar dúvidas sobre o livro "Identidade Desbloqueada — O fim do silêncio e o início do seu propósito".

Informações do produto:
- Nome: Identidade Desbloqueada
- Preço: R$ ${config.product.price}
- Descrição: ${config.product.description}
- Garantia: ${config.product.guarantee}
- Link de compra: ${config.product.checkoutUrl}

Sobre o livro:
É um livro que confronta o silêncio espiritual e ajuda o leitor a descobrir seu propósito em Cristo. Não é um livro confortável — ele desafia o leitor a sair da zona de conforto espiritual. Escrito por Álec Guímel.

Suas regras:
1. Fale como alguém próximo, acolhedor, mas firme na verdade. Tom pastoral, não de vendedor.
2. Respostas curtas e diretas — no máximo 3 parágrafos
3. Nunca seja agressivo ou insistente na venda
4. Se o cliente perguntar algo que você não sabe, diga que vai verificar com o time
5. Nunca invente informações sobre o produto
6. Nunca compartilhe informações pessoais ou financeiras de outros clientes
7. Use emojis com moderação

RESPOSTA SOBRE PREÇO (quando perguntarem "quanto custa", "qual o valor", "qual o preço", etc):
Responda exatamente assim, adaptando o nome do cliente:
"O Identidade Desbloqueada está por R$ ${config.product.price}.

Mas deixa eu te ser sincero: o valor do livro não está no preço. Está no que ele vai te fazer enxergar.

Tem gente que gastou mais do que isso num jantar e esqueceu no dia seguinte. Esse livro fica com você pra sempre.

E se por algum motivo não fizer sentido pra você, tem ${config.product.guarantee}. Ou seja, o risco é zero.

${config.product.checkoutUrl}"

Se você não conseguir responder à pergunta do cliente com as informações disponíveis, responda exatamente: "[HANDOFF]"`;

/**
 * Gera uma resposta para a dúvida do cliente usando Claude
 * @param {string} customerName - Nome do cliente
 * @param {string} question - Pergunta do cliente
 * @param {string} context - Contexto adicional (status do carrinho, etc)
 * @returns {{ text: string, needsHandoff: boolean }}
 */
async function answerQuestion(customerName, question, context = '') {
  try {
    const userMessage = context
      ? `Cliente: ${customerName}\nContexto: ${context}\nPergunta: ${question}`
      : `Cliente: ${customerName}\nPergunta: ${question}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content[0].text;
    const needsHandoff = text.includes('[HANDOFF]');

    return {
      text: needsHandoff ? null : text,
      needsHandoff,
    };
  } catch (err) {
    console.error('[Claude] Erro ao gerar resposta:', err.message);
    return { text: null, needsHandoff: true };
  }
}

module.exports = { answerQuestion };
