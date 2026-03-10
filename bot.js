const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
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

client.on('message', msg => {

 const texto = msg.body ? msg.body.toLowerCase() : "";

 // ajuda
 if (texto === '/ajuda') {

  msg.reply(
`📊 *GastoZap*

Envie:
50 gasolina
30 almoço

Comandos:

/saldo
/hoje
/mes
/lista
/ajuda`
  );

  return;
 }

 // saldo total
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

 // gastos de hoje
 if (texto === '/hoje') {

  const hoje = new Date().toISOString().split("T")[0];

  db.get(
   "SELECT SUM(valor) as total FROM gastos WHERE date(data) = ?",
   [hoje],
   (err, row) => {

    if (row && row.total) {
     msg.reply(`📅 Gastos de hoje: R$${row.total}`);
    } else {
     msg.reply("📅 Nenhum gasto hoje.");
    }

   }
  );

  return;
 }

 // gastos do mes
 if (texto === '/mes') {

  const mes = new Date().toISOString().slice(0,7);

  db.get(
   "SELECT SUM(valor) as total FROM gastos WHERE substr(data,1,7) = ?",
   [mes],
   (err, row) => {

    if (row && row.total) {
     msg.reply(`📊 Total do mês: R$${row.total}`);
    } else {
     msg.reply("📊 Nenhum gasto este mês.");
    }

   }
  );

  return;
 }

 // lista ultimos gastos
 if (texto === '/lista') {

  db.all(
   "SELECT valor, categoria FROM gastos ORDER BY id DESC LIMIT 5",
   [],
   (err, rows) => {

    if (!rows.length) {
     msg.reply("📜 Nenhum gasto registrado.");
     return;
    }

    let resposta = "📜 Últimos gastos\n\n";

    rows.forEach(g => {
     resposta += `R$${g.valor} - ${g.categoria}\n`;
    });

    msg.reply(resposta);

   }
  );

  return;
 }

 // detectar gasto
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