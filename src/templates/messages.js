const config = require('../config');

const { name: produto, price: preco, checkoutUrl, guarantee } = config.product;

const messages = {
  // =============================================
  // CARRINHO ABANDONADO
  // =============================================
  abandonedCart: {
    first: (nome) =>
      `Oi ${nome}, tudo bem? 😊\n\n` +
      `Vi que você estava dando uma olhada no *${produto}* e não finalizou.\n\n` +
      `Aconteceu alguma coisa? Ficou com alguma dúvida?\n\n` +
      `Estou aqui pra te ajudar! Se quiser continuar, é só acessar:\n` +
      `${checkoutUrl}\n\n` +
      `Lembrando que você tem ${guarantee} 💚`,

    second: (nome) =>
      `${nome}, passando aqui rapidinho! ⏰\n\n` +
      `O *${produto}* está com muita procura e não quero que você perca essa oportunidade.\n\n` +
      `Muita gente já está tendo resultados incríveis!\n\n` +
      `Garanta o seu agora: ${checkoutUrl}\n\n` +
      `Qualquer dúvida, me chama aqui! 😉`,

    third: (nome) =>
      `${nome}, última chance! 🚀\n\n` +
      `Essa é a minha última mensagem sobre o *${produto}*.\n\n` +
      `Sei que às vezes a gente precisa de um empurrãozinho, então vou deixar seu link especial aqui:\n` +
      `${checkoutUrl}\n\n` +
      `Depois dessa, não vou mais te incomodar. Mas fica a dica: quem já comprou, não se arrependeu! 💪\n\n` +
      `${guarantee} — zero risco pra você.`,
  },

  // =============================================
  // PIX GERADO
  // =============================================
  pix: {
    first: (nome) =>
      `Oi ${nome}! 😊\n\n` +
      `Vi que você gerou um Pix para o *${produto}* no valor de R$ ${preco}.\n\n` +
      `Só falta concluir o pagamento! O código Pix tem validade limitada ⏳\n\n` +
      `Se precisar gerar um novo, é só acessar: ${checkoutUrl}\n\n` +
      `Ficou com alguma dúvida? Me chama aqui!`,

    second: (nome) =>
      `${nome}, seu Pix está prestes a expirar! ⚠️\n\n` +
      `Não deixe para depois — garanta seu acesso ao *${produto}* agora.\n\n` +
      `Gere um novo Pix aqui: ${checkoutUrl}\n\n` +
      `O pagamento é instantâneo e o acesso é liberado na hora! 🚀`,
  },

  // =============================================
  // BOLETO GERADO
  // =============================================
  boleto: {
    first: (nome) =>
      `Oi ${nome}! 😊\n\n` +
      `Percebi que você gerou um boleto para o *${produto}*.\n\n` +
      `Só um lembrete: o boleto vence em breve! Não esqueça de pagar para garantir seu acesso.\n\n` +
      `Se precisar de uma segunda via, acesse: ${checkoutUrl}\n\n` +
      `Alguma dúvida? Estou aqui!`,

    second: (nome) =>
      `${nome}, seu boleto do *${produto}* vence amanhã! 📋\n\n` +
      `Não perca o acesso — pague hoje para garantir.\n\n` +
      `Se preferir, você pode pagar via Pix que é instantâneo! Acesse: ${checkoutUrl}\n\n` +
      `Precisa de ajuda? Me chama! 😉`,

    third: (nome) =>
      `${nome}, vi que o boleto do *${produto}* não foi pago 😕\n\n` +
      `Que tal pagar via *Pix*? É instantâneo e o acesso é liberado na hora!\n\n` +
      `Acesse aqui: ${checkoutUrl}\n\n` +
      `Lembrando: ${guarantee}. Ou seja, zero risco pra você! 💚\n\n` +
      `Se tiver qualquer dúvida, pode me chamar!`,
  },

  // =============================================
  // COMPRA APROVADA
  // =============================================
  purchaseApproved: (nome) =>
    `Parabéns, ${nome}! 🎉🎉\n\n` +
    `Sua compra do *${produto}* foi aprovada com sucesso!\n\n` +
    `Você fez uma ótima escolha. Seu acesso será liberado em instantes.\n\n` +
    `Se precisar de qualquer ajuda, estou por aqui! 💚`,

  // =============================================
  // MENSAGEM DE FALLBACK (IA não soube responder)
  // =============================================
  humanHandoff: (nome) =>
    `${nome}, ótima pergunta! 🤔\n\n` +
    `Vou encaminhar para nosso time de suporte para te dar a melhor resposta.\n\n` +
    `Em breve alguém vai te retornar. Obrigado pela paciência! 🙏`,
};

module.exports = messages;
