const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const OpenAI = require("openai");

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY
});

const client = new Client({
 authStrategy: new LocalAuth(),
 puppeteer: {
  args: ['--no-sandbox', '--disable-setuid-sandbox']
 }
});

let gastos = [];

client.on('qr', qr => {
 console.log("QR RECEIVED");
 qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
 console.log('Bot conectado!');
});

async function transcreverAudio() {

 const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("audio.ogg"),
  model: "whisper-1"
 });

 return transcription.text;
}

client.on('message', async msg => {

 const texto = msg.body ? msg.body.toLowerCase() : "";

 // comando gasto
 if (texto.startsWith('/gasto')) {

  const partes = texto.split(' ');
  const valor = parseFloat(partes[1]);
  const categoria = partes.slice(2).join(' ');

  gastos.push({
   valor,
   categoria,
   data: new Date()
  });

  msg.reply(`✅ Gasto registrado\n💰 R$${valor}\n📂 ${categoria}`);
 }

 // comando saldo
 if (texto === '/saldo') {

  const total = gastos.reduce((soma, g) => soma + g.valor, 0);

  msg.reply(`💰 Total gasto: R$${total}`);
 }

 // comando ajuda
 if (texto === '/ajuda') {

  msg.reply(
`📊 *GastoZap comandos*

/gasto 50 gasolina
/gasto 30 almoço

/saldo
/ajuda

🎤 envie áudio dizendo:
"gastei 20 no mercado"`
  );
 }

 // detectar audio
 if (msg.hasMedia && msg.type === "ptt") {

  const media = await msg.downloadMedia();

  const buffer = Buffer.from(media.data, 'base64');

  fs.writeFileSync("audio.ogg", buffer);

  msg.reply("🎤 Processando áudio...");

  try {

   const textoAudio = await transcreverAudio();

   msg.reply("📝 Você disse: " + textoAudio);

  } catch (erro) {

   console.log(erro);

   msg.reply("❌ erro ao processar áudio");

  }

 }

});

client.initialize();
// detectar gasto por texto
const regexGasto = /(\d+)\s*(.*)/;
