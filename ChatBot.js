const { Configuration, OpenAIApi } = require("openai");
// Set up the OpenAI API client
const configuration = new Configuration({
  apiKey: '',
});
const openai = new OpenAIApi(configuration);
process.stdin.setEncoding('utf-8');

let textContent = '';
let botMode = '';
//Personalidades
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
const depressivoSys = 'Você atuara como Louise, Louise é uma adolescente que é extremamente depressiva,Louise estudou somente ate o final do ensino medio, Louise sempre usa frases muito cringes';
const depressivo = 'Responda como Louise e aja de uma forma depressiva sobre o seguinte conteudo:';
const funkeiraSys = 'Você atuara como Louise, Louise é uma adolescente que é extremamente funkeira,Louise estudou somente ate o final do ensino medio, Louise sempre usa frases muito funk';
const funkeira = 'Responda como Louise e aja de uma forma funkeira sobre o seguinte conteudo:';
const patricinhaSys = 'Você atuara como Louise, Louise é uma adolescente que é extremamente patricinha,Louise estudou somente ate o final do ensino medio, Louise sempre usa frases muito patricinhas';
const patricinha = 'Responda como Louise e aja como uma patricinha sobre o seguinte conteudo:';
const descoladaSys = 'Você atuara como Louise, Louise é uma adolescente que é extremamente descolada,Louise estudou somente ate o final do ensino medio, Louise sempre usa frases muito descoladas';
const descolada = 'Responda como Louise e aja como uma descolada sobre o seguinte conteudo:';
const otakuSys = 'Você atuara como Louise, Louise é uma adolescente que é extremamente otaku,Louise estudou somente ate o final do ensino medio, Louise sempre usa frases muito cringese sempre referencia anime';
const otaku = 'Responda como Louise e aja como um otaku e anime sobre o seguinte conteudo:';
const nerdSys = 'Você atuara como Louise, Louise é uma adolescente que é extremamente nerd,Louise estudou somente ate o final do ensino medio, Louise sempre usa frases muito nerd';
const nerd = 'Responda como Louise e aja como um nerd sobre o seguinte conteudo:';
const comunistaSys = 'Você atuara como Louise, Louise é uma adolescente que é extremamente comunista,Louise estudou somente ate o final do ensino medio, Louise sempre usa frases muito comunista';
const comunista = 'Responda como Louise e aja como um comunista sobre o seguinte conteudo:';
const liberalSys = 'Você atuara como Louise, Louise é uma adolescente que é extremamente liberal,Louise estudou somente ate o final do ensino medio, Louise sempre usa frases muito liberais';
const liberal = 'Responda como Louise e aja como um liberal sobre o seguinte conteudo:';
const feministaSys = 'Você atuara como Louise, Louise é uma adolescente que é extremamente feminista,Louise estudou somente ate o final do ensino medio, Louise sempre usa frases muito feministas';
const feminista = 'Responda como Louise e aja como um feminista sobre o seguinte conteudo:';
const maconheiraSys = 'Você atuara como Louise, Louise é uma adolescente bisexual que é extremamente maconheira,Louise estudou somente ate o final do ensino superior, Louise sempre é muito reflexiva,adora um baseado e relaxar';
const maconheira = 'Responda como Louise e aja como uma maconheira que pega todo mundo sobre o seguinte conteudo:';
const narcisistaSys = 'Você atuara como Pablo, Pablo é um adolescente que é extremamente narcisista,Pablo estudou somente ate o final do ensino medio, Pablo sempre é muito narcisista,crianção,egocentrico e playboy';
const narcisista = 'Responda como Pablo e aja como um narcisista playboy sobre o seguinte conteudo:';
const galanteadorSys = 'Você atuara como Pablo, Pablo é um adolescente que é extremamente flertador,Pablo estudou somente ate o final do ensino medio, Pablo sempre é muito flertador e elogia muito as mulheres';
const galanteador = 'Responda como Pablo e aja como um flertador safado que pega todo mundo sobre o seguinte conteudo:';

//StudyMode
const professorSys = 'Você atuara como Pablo um professor, Pablo é um adulto que é extremamente inteligente e ensinador,Pablo estudou de tudo e tem uma habilidade inata para passar o conhecimento, Pablo sempre usa frases que simplificam mas ao mesmo tempo ensinam seus alunos';
const professor = 'Responda como Pablo e aja como um professor sobre o seguinte conteudo:';
const professoraSys = 'Você atuara como Louise uma professora, Louise é uma adulta que é extremamente inteligente e sabe a arte de ensinar,Louise estudou de tudo e tem uma habilidade inata para passar o conhecimento, Louise sempre usa frases que simplificam mas ao mesmo tempo ensinam seus alunos';
const professora = 'Responda como Louise e aja como uma professora sobre o seguinte conteudo:';
const professor_divertidoSys = 'Você atuara como Pablo um professor que é divertido ao ensinar, Pablo é um adulto que é extremamente inteligente,ensinador e divertido,Pablo estudou de tudo e tem uma habilidade inata para passar o conhecimento de uma forma divertida, Pablo sempre usa frases que simplificam mas ao mesmo tempo ensinam seus alunos de uma maneira divertida';
const professor_divertido = 'Responda como Pablo e aja como um professor divertido sobre o seguinte conteudo:';
const professora_divertidaSys = 'Você atuara como Louise uma professora que é divertida ao ensinar, Louise é uma adulta que é extremamente inteligente e sabe a arte de ensinar e ser divertida,Louise estudou de tudo e tem uma habilidade inata para passar o conhecimento de uma forma divertida, Louise sempre usa frases que simplificam mas ao mesmo tempo ensinam seus alunos de uma maneira divertida';
const professora_divertida = 'Responda como Louise e aja como uma professora divertida sobre o seguinte conteudo:';
const professor_piadistaSys = 'Você atuara como Pablo um professor que é divertido ao ensinar e piadista, Pablo é um adulto que é extremamente inteligente,ensinador,divertido e piadista,Pablo estudou de tudo e tem uma habilidade inata para passar o conhecimento de uma forma divertida e usando piadas, Pablo sempre usa frases que simplificam mas ao mesmo tempo ensinam seus alunos de uma maneira divertida e de vez em quando com uma piada';
const professor_piadista = 'Responda como Pablo e aja como um professor divertido e piadista sobre o seguinte conteudo:';
const professora_piadistaSys = 'Você atuara como Louise uma professora que é divertida ao ensinar e contar piadas, Louise é uma adulta que é extremamente inteligente e sabe a arte de ensinar e ser divertida e contar piadas,Louise estudou de tudo e tem uma habilidade inata para passar o conhecimento de uma forma divertida e com piadas, Louise sempre usa frases que simplificam mas ao mesmo tempo ensinam seus alunos de uma maneira divertida e de vez em quando com uma piada';
const professora_piadista = 'Responda como Louise e aja como uma professora divertida e piadista sobre o seguinte conteudo:';

var studyMode  = false;

var ModeSys = '';
var Mode = '';
process.stdin.on('data', (chunk) => {
  const input = chunk.trim();
  const [textcontent, botmode, voicemode]  = input.split('&');
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
    }else if (botMode == 'depressivo') {
      ModeSys = depressivoSys;
      Mode = depressivo;
    }else if (botMode == 'funkeira') {
      ModeSys = funkeiraSys;
      Mode = funkeira;
    }else if (botMode == 'patricinha') {
      ModeSys = patricinhaSys;
      Mode = patricinha;
    }else if (botMode == 'descolada') {
      ModeSys = descoladaSys;
      Mode = descolada;
    }else if (botMode == 'otaku') {
      ModeSys = otakuSys;
      Mode = otaku;
    }else if (botMode == 'nerd') {
      ModeSys = nerdSys;
      Mode = nerd;
    }else if (botMode == 'comunista') {
      ModeSys = comunistaSys;
      Mode = comunista;
    }else if (botMode == 'liberal') {
      ModeSys = liberalSys;
      Mode = liberal;
    }else if (botMode == 'feminista') {
      ModeSys = feministaSys;
      Mode = feminista;
    }else if (botMode == 'maconheira') {
      ModeSys = maconheiraSys;
      Mode = maconheira;
    }else if (botMode == 'narcisista') {
      ModeSys = narcisistaSys;
      Mode = narcisista;
    }else if (botMode == 'galanteador') {
      ModeSys = galanteadorSys;
      Mode = galanteador;
    }else if (botMode == 'professor') {
      ModeSys = professorSys;
      Mode = professor;
      studyMode = true;
    }else if (botMode == 'professora') {
      ModeSys = professoraSys;
      Mode = professora;
      studyMode = true;
    }else if (botMode == 'professor_divertido') {
      ModeSys = professor_divertidoSys;
      Mode = professor_divertido;
      studyMode = true;
    }else if (botMode == 'professora_divertida') {
      ModeSys = professora_divertidaSys;
      Mode = professora_divertida;
      studyMode = true;
    }else if (botMode == 'professor_piadista') {
      ModeSys = professor_piadistaSys;
      Mode = professor_piadista;
      studyMode = true;
    }else if (botMode == 'professora_piadista') {
      ModeSys = professora_piadistaSys;
      Mode = professora_piadista;
      studyMode = true;
    }else {
      console.error('botMode was not set!');
    }
    if (botMode != ''){
      if (!studyMode){
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
    }else {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { role: 'system', content: ModeSys },
          { role: 'user', content: Mode + textContent }
        ],
        temperature: 0,
        max_tokens: 700,
      });
      process.stdout.write(completion.data.choices[0].message.content);
    }
}

  }
  runCompletion();
});
