const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./gastos.db');

db.run(`
CREATE TABLE IF NOT EXISTS gastos (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 valor REAL,
 categoria TEXT,
 data TEXT
)
`);

const client = new Client({
 authStrategy: new LocalAuth(),
 puppeteer: {
  args: ['--no-sandbox', '--disable-setuid-sandbox']
 }
});

client.on('qr', qr => {
 console.log("QR RECEIVED");
 qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
 console.log('Bot conectado!');
});

client.on('message', async msg => {

 const texto = msg.body ? msg.body.toLowerCase() : "";

 // comando ajuda
 if (texto === '/ajuda') {

  msg.reply(
`📊 *GastoZap comandos*

Envie apenas:

50 gasolina
30 almoço
20 uber

Comandos:

/saldo
/ajuda`
  );

  return;
 }

 // comando saldo
 if (texto === '/saldo') {

  db.get(
   "SELECT SUM(valor) as total FROM gastos",
   [],
   (err, row) => {

    if (row && row.total) {
     msg.reply(`💰 Total gasto: R$${row.total}`);
    } else {
     msg.reply("💰 Nenhum gasto registrado.");
    }

   }
  );

  return;
 }

 // detectar gasto por texto
 const regexGasto = /(\d+)\s*(.*)/;

 if (regexGasto.test(texto)) {

  const match = texto.match(regexGasto);

  const valor = parseFloat(match[1]);
  const categoria = match[2] || "outros";

  db.run(
   "INSERT INTO gastos (valor, categoria, data) VALUES (?, ?, ?)",
   [valor, categoria, new Date().toISOString()]
  );

  msg.reply(`✅ Gasto registrado\n💰 R$${valor}\n📂 ${categoria}`);

 }

});

client.initialize();