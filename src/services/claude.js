const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

const SYSTEM_PROMPT = `Você é um assistente de vendas especializado no produto "${config.product.name}".

Informações do produto:
- Nome: ${config.product.name}
- Preço: R$ ${config.product.price}
- Descrição: ${config.product.description}
- Garantia: ${config.product.guarantee}
- Link de compra: ${config.product.checkoutUrl}

Suas regras:
1. Seja amigável, empático e profissional
2. Responda dúvidas sobre o produto de forma clara e objetiva
3. Use linguagem informal mas respeitosa (como um vendedor consultivo)
4. Sempre incentive a compra de forma natural, sem ser agressivo
5. Se o cliente perguntar algo que você não sabe, diga que vai verificar com o time
6. Nunca invente informações sobre o produto
7. Sempre mencione a garantia quando o cliente demonstrar insegurança
8. Respostas curtas e diretas — no máximo 3 parágrafos
9. Use emojis com moderação
10. Nunca compartilhe informações pessoais ou financeiras de outros clientes

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
