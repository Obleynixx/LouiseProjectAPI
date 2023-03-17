const { Configuration, OpenAIApi } = require("openai");
// Set up the OpenAI API client
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);
process.stdin.setEncoding('utf-8');

let textContent = '';
let botMode = '';
const raivaModeSys = 'Você atuara como Louise, Louise não sabe responder todas as perguntas, Louise xinga bastante em todas as suas falas e não censura';
const raivaMode = 'Responda como Louise e xingue o seguinte conteudo:';
const meigaModeSys = 'Você atuara como Louise, Louise não sabe responder todas as perguntas, Louise sempre elogia bastante em todas as suas falas';
const meigaMode = 'Responda como Louise e elogie o seguinte conteudo:';
const paranoicaModeSys = 'Você atuara como Louise, Louise é extremamente paranoica, Louise sempre duvida de todas as falas mas nunca demonstra abertamente';
const paranoicaMode = 'Responda como Louise e seja paranoica sobre o seguinte conteudo:';
const adolescenteSys = 'Você atuara como Louise, Louise é uma adolescente que é extremamente cringe,Louise estudou somente ate o final do ensino medio, Louise sempre usa frases muito cringes';
const adolescente = 'Responda como Louise e aja de uma forma cringe sobre o seguinte conteudo:';
const conservadoraSys = 'Você atuara como Louise, Louise é uma adolescente que é extremamente conservadora e politizada,Louise estudou somente ate o final do ensino medio e sempre frequentou igrejas, Louise sempre usa frases muito cringes';
const conservadora = 'Responda como Louise e aja de uma forma conservadora e politizada sobre o seguinte conteudo:';

var ModeSys = '';
var Mode = '';
process.stdin.on('data', (chunk) => {
  const input = chunk.trim();
  const [textcontent, botmode] = input.split('&');
  botMode=botmode;
  textContent=textcontent;
});
process.stdin.on('end', () => {
  async function runCompletion() {
    if (botMode == 'raiva') {
      ModeSys = raivaModeSys;
      Mode = raivaMode;
    } else if (botMode == 'meiga') {
      ModeSys = meigaModeSys;
      Mode = meigaMode;
    } else if (botMode == 'paranoica') {
      ModeSys = paranoicaModeSys;
      Mode = paranoicaMode;
    } else if (botMode == 'adolescente') {
      ModeSys = adolescenteSys;
      Mode = adolescente;
    }else if (botMode == 'conservadora') {
      ModeSys = conservadoraSys;
      Mode = conservadora;
    }
    else {
      console.error('botMode was not set!');
    }
    if (botMode != ''){
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: 'system', content: ModeSys },
        { role: 'user', content: Mode + textContent }
      ],
      temperature: 0,
      max_tokens: 220,
    });
    process.stdout.write(completion.data.choices[0].message.content);
  }

  }
  runCompletion();
});