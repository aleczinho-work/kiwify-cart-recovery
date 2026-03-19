const config = require('../config');

const { name: produto, price: preco, checkoutUrl, guarantee } = config.product;

const messages = {
  // =============================================
  // CARRINHO ABANDONADO
  // =============================================
  abandonedCart: {
    first: (nome) =>
      `Olá tudo bem? Fico feliz que você tenha tomado essa decisão de buscar mais sobre Cristo!\n\n` +
      `Você chegou até aqui por um motivo.\n` +
      `Não foi curiosidade.\n` +
      `Não foi impulso.\n\n` +
      `Quando alguém abandona esse livro, quase nunca é por preço.\n` +
      `É porque a verdade começou a incomodar.\n\n` +
      `*Identidade Desbloqueada* não é um livro confortável.\n` +
      `Ele confronta o silêncio que você aprendeu a carregar.\n\n` +
      `Se você sente que ainda não é o momento, tudo bem.\n` +
      `Mas se você sabe que está evitando uma decisão...\n` +
      `talvez esse seja exatamente o ponto.\n\n` +
      `O acesso continua disponível.\n` +
      `Retomar acesso ao livro: ${checkoutUrl}`,

    second: (nome) =>
      `${nome}, eu não sei o que te travou.\n\n` +
      `Talvez tenha sido o momento. Talvez a dúvida.\n` +
      `Talvez algo dentro de você disse "ainda não".\n\n` +
      `Mas eu preciso ser honesto com você:\n` +
      `o *Identidade Desbloqueada* não foi escrito pra quem está pronto.\n` +
      `Foi escrito pra quem está cansado de esperar estar pronto.\n\n` +
      `Cada capítulo desse livro foi pensado pra quebrar uma camada de silêncio.\n` +
      `E quem já leu sabe: depois que você enxerga, não tem como voltar atrás.\n\n` +
      `Se você sente que esse livro é pra você, o link ainda está ativo:\n` +
      `${checkoutUrl}\n\n` +
      `E lembre-se: você tem ${guarantee}. Se não fizer sentido, devolvemos cada centavo.`,

    third: (nome) =>
      `${nome}, essa é a última vez que vou falar sobre isso.\n\n` +
      `Eu não vou insistir. Não é assim que funciona.\n\n` +
      `Mas antes de encerrar, quero te deixar uma reflexão:\n\n` +
      `_Quantas vezes você sentiu que Deus estava te chamando pra algo maior...\n` +
      `e deixou passar?_\n\n` +
      `O *Identidade Desbloqueada* existe pra ser o ponto de virada.\n` +
      `O fim do silêncio. O início do seu propósito.\n\n` +
      `Se for pra você, você sabe.\n` +
      `${checkoutUrl}\n\n` +
      `Deus te abençoe, independente da sua decisão.`,
  },

  // =============================================
  // PIX GERADO
  // =============================================
  pix: {
    first: (nome) =>
      `Olá ${nome}! Vi que você gerou o Pix para o *Identidade Desbloqueada*.\n\n` +
      `Você já deu o passo mais importante: decidiu.\n` +
      `Agora só falta concluir.\n\n` +
      `O código Pix tem validade limitada. Se expirou, sem problema, é só gerar um novo aqui:\n` +
      `${checkoutUrl}\n\n` +
      `O pagamento é instantâneo e o acesso é liberado na hora.\n\n` +
      `Se tiver qualquer dúvida ou dificuldade com o pagamento, me chama aqui que te ajudo!`,

    second: (nome) =>
      `${nome}, percebi que o Pix do *Identidade Desbloqueada* ainda não foi concluído.\n\n` +
      `Eu entendo que às vezes a correria do dia atrapalha.\n` +
      `Mas não deixe essa decisão esfriar.\n\n` +
      `Você sentiu algo quando chegou até aquele checkout.\n` +
      `Aquilo não foi por acaso.\n\n` +
      `Gere um novo Pix aqui (leva menos de 1 minuto):\n` +
      `${checkoutUrl}\n\n` +
      `Lembrando: ${guarantee}. Zero risco pra você.`,
  },

  // =============================================
  // BOLETO GERADO
  // =============================================
  boleto: {
    first: (nome) =>
      `Oi ${nome}! Vi que você gerou um boleto para o *Identidade Desbloqueada*.\n\n` +
      `Só passando pra lembrar: o boleto tem data de vencimento, então não deixe passar!\n\n` +
      `Se precisar de uma segunda via ou quiser acessar o boleto novamente:\n` +
      `${checkoutUrl}\n\n` +
      `Qualquer dúvida sobre o pagamento, é só me chamar aqui.`,

    second: (nome) =>
      `${nome}, o boleto do *Identidade Desbloqueada* vence em breve.\n\n` +
      `Se ainda não conseguiu pagar, tenho uma sugestão:\n` +
      `você pode pagar via *Pix* que é instantâneo e o acesso é liberado na hora!\n\n` +
      `Acesse aqui e escolha Pix como forma de pagamento:\n` +
      `${checkoutUrl}\n\n` +
      `É mais rápido, mais fácil, e você já começa a leitura hoje mesmo.`,

    third: (nome) =>
      `${nome}, vi que o boleto não foi pago.\n\n` +
      `Eu sei que boleto às vezes complica. Esquece, vence, dá trabalho.\n\n` +
      `Por isso quero te oferecer uma alternativa:\n` +
      `pague via *Pix* e o acesso ao *Identidade Desbloqueada* é liberado na hora.\n\n` +
      `${checkoutUrl}\n\n` +
      `E lembre-se: você tem ${guarantee}.\n` +
      `Se o livro não fizer sentido pra você, devolvemos o valor.\n` +
      `Sem perguntas, sem burocracia.\n\n` +
      `Essa é a minha última mensagem. A decisão é sua.\n` +
      `Que Deus te ilumine nessa escolha.`,
  },

  // =============================================
  // COMPRA APROVADA
  // =============================================
  purchaseApproved: (nome) =>
    `${nome}, sua compra do *Identidade Desbloqueada* foi aprovada!\n\n` +
    `Que alegria ter você nessa jornada!\n\n` +
    `Esse livro foi escrito com propósito, e eu creio que vai transformar a forma como você se enxerga diante de Deus.\n\n` +
    `Seu acesso será liberado em instantes.\n` +
    `Qualquer dúvida, estou por aqui.\n\n` +
    `Que Deus te abençoe nessa leitura!\n` +
    `- Álec Guímel`,

  // =============================================
  // MENSAGEM DE FALLBACK (IA não soube responder)
  // =============================================
  humanHandoff: (nome) =>
    `${nome}, ótima pergunta!\n\n` +
    `Vou encaminhar para que alguém do nosso time possa te dar a melhor resposta.\n\n` +
    `Em breve você receberá um retorno. Obrigado pela paciência!`,
};

module.exports = messages;
