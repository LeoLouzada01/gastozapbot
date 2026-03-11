const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./gastos.db");

db.run(`
CREATE TABLE IF NOT EXISTS gastos (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 valor REAL,
 categoria TEXT,
 data TEXT
)
`);

app.get("/api/gastos",(req,res)=>{
 db.all("SELECT * FROM gastos ORDER BY id DESC",(err,rows)=>{
  res.json(rows);
 });
});

app.get("/api/saldo",(req,res)=>{
 db.get("SELECT SUM(valor) as total FROM gastos",(err,row)=>{
  res.json(row);
 });
});

app.post("/api/add",(req,res)=>{
 const {valor,categoria}=req.body;

 db.run(
  "INSERT INTO gastos(valor,categoria,data) VALUES(?,?,?)",
  [valor,categoria,new Date().toISOString()]
 );

 res.json({ok:true});
});

app.listen(3000,()=>{
 console.log("Painel rodando porta 3000");
});

const client = new Client({
 authStrategy: new LocalAuth(),
 puppeteer:{
  args:['--no-sandbox','--disable-setuid-sandbox']
 }
});

client.on('qr', qr=>{
 qrcode.generate(qr,{small:true});
});

client.on('ready',()=>{
 console.log("BOT WHATSAPP ONLINE");
});

client.on('message', msg=>{

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