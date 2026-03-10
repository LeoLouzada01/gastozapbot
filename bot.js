const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

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

client.on('message', msg => {

  const texto = msg.body.toLowerCase();

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

  if (texto === '/saldo') {

    const total = gastos.reduce((soma, g) => soma + g.valor, 0);

    msg.reply(`💰 Total gasto: R$${total}`);
  }

  if (texto === '/ajuda') {

    msg.reply(
`📊 *GastoZap comandos*

/gasto 50 gasolina
/gasto 30 almoço

/saldo
/ajuda`
    );

  }

});

client.initialize();