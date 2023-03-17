const { Configuration, OpenAIApi } = require("openai");
// Set up the OpenAI API client
const configuration = new Configuration({
    apiKey: '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',
  });
  const openai = new OpenAIApi(configuration);
  process.stdin.setEncoding('utf-8');

let textContent = '';

process.stdin.on('data', (chunk) => {
  textContent += chunk;
});
process.stdin.on('end', () => {
async function runCompletion () {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: 'system', content: 'Você atuara como Louise, Louise não sabe responder todas as perguntas, Louise xinga bastante em todas as suas falas e não censura' },
        { role: 'user', content: 'Responda como Louise e xingue o seguinte conteudo:'+textContent }
      ],
      temperature: 0,
      max_tokens: 220,
    });
    
    process.stdout.write(completion.data.choices[0].message.content);

    }
runCompletion();
});