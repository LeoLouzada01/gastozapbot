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
  args: ['--no-sandbox','--disable-setuid-sandbox']
 }
});

client.on('qr', qr => {
 qrcode.generate(qr,{small:true});
});

client.on('ready', () => {
 console.log("BOT ONLINE");
});

client.on('message', msg => {

 const texto = msg.body.toLowerCase();

 if(texto === "/saldo"){

  db.get(
   "SELECT SUM(valor) as total FROM gastos",
   (err,row)=>{
    msg.reply("💰 Total: R$ "+(row.total||0));
   }
  );

 }

 if(texto.startsWith("/add")){

  const partes = texto.split(" ");

  const valor = parseFloat(partes[1]);
  const categoria = partes.slice(2).join(" ");

  db.run(
   "INSERT INTO gastos(valor,categoria,data) VALUES(?,?,?)",
   [valor,categoria,new Date().toISOString()]
  );

  msg.reply("✅ Gasto registrado");

 }

});

client.initialize();