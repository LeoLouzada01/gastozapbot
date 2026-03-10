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
 qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
 console.log("✅ Bot conectado");
});

client.on('message', msg => {

 const texto = msg.body ? msg.body.toLowerCase() : "";

 // AJUDA
 if (texto === "/ajuda") {

  msg.reply(
`📊 GastoZap

Registrar gasto:
40 gasolina

Ou comando:
/add 40 gasolina

Comandos:

/saldo
/hoje
/mes
/lista
/ajuda`
  );

  return;
 }

 // COMANDO ADD
 if (texto.startsWith("/add")) {

  const partes = texto.split(" ");

  const valor = parseFloat(partes[1]);
  const categoria = partes.slice(2).join(" ") || "outros";

  if (!valor) {
   msg.reply("❌ Use: /add 40 gasolina");
   return;
  }

  db.run(
   "INSERT INTO gastos (valor, categoria, data) VALUES (?, ?, ?)",
   [valor, categoria, new Date().toISOString()]
  );

  msg.reply(`✅ Gasto registrado\n💰 R$${valor}\n📂 ${categoria}`);

  return;
 }

 // SALDO
 if (texto === "/saldo") {

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

 // HOJE
 if (texto === "/hoje") {

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

 // MES
 if (texto === "/mes") {

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

 // LISTA
 if (texto === "/lista") {

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
     resposta += `💰 R$${g.valor} - ${g.categoria}\n`;
    });

    msg.reply(resposta);

   }
  );

  return;
 }

 // MULTIPLOS GASTOS NA MESMA FRASE
 const regex = /(\d+)\s*(?:no|em)?\s*([a-zA-Z]+)/g;

 const encontrados = [...texto.matchAll(regex)];

 if (encontrados.length > 0) {

  let resposta = "✅ Gastos registrados\n\n";

  encontrados.forEach(g => {

   const valor = parseFloat(g[1]);
   const categoria = g[2];

   db.run(
    "INSERT INTO gastos (valor, categoria, data) VALUES (?, ?, ?)",
    [valor, categoria, new Date().toISOString()]
   );

   resposta += `💰 R$${valor} - ${categoria}\n`;

  });

  msg.reply(resposta);

 }

});

client.initialize();