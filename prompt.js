const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');

const db = new sqlite3.Database('./gastos.db');

db.run(`
CREATE TABLE IF NOT EXISTS gastos (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 valor REAL,
 categoria TEXT,
 data TEXT
)
`);

const rl = readline.createInterface({
 input: process.stdin,
 output: process.stdout
});

console.log("Modo prompt ativo");
console.log("Digite exemplo: 40 gasolina");

rl.on("line",(input)=>{

 const partes = input.split(" ");

 const valor = parseFloat(partes[0]);

 if(isNaN(valor)){
  console.log("❌ Digite no formato: 40 gasolina");
  return;
 }

 const categoria = partes.slice(1).join(" ") || "outros";

 db.run(
  "INSERT INTO gastos(valor,categoria,data) VALUES(?,?,?)",
  [valor,categoria,new Date().toISOString()]
 );

 console.log("✅ Gasto registrado:",valor,categoria);

});