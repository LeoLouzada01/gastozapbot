const express = require("express")
const sqlite3 = require("sqlite3").verbose()

const app = express()

app.use(express.json())

const db = new sqlite3.Database("./gastos.db")

db.run(`
CREATE TABLE IF NOT EXISTS gastos(
id INTEGER PRIMARY KEY AUTOINCREMENT,
descricao TEXT,
valor REAL
)
`)

app.get("/", (req,res)=>{
res.send("GastoZap rodando 🚀")
})

app.get("/gastos",(req,res)=>{

db.all("SELECT * FROM gastos",(err,rows)=>{
if(err) return res.send(err)

res.json(rows)

})

})

app.post("/gastos",(req,res)=>{

const {descricao,valor}=req.body

db.run(
"INSERT INTO gastos(descricao,valor) VALUES(?,?)",
[descricao,valor]
)

res.send("ok")

})

const PORT = process.env.PORT || 3000

app.listen(PORT,"0.0.0.0",()=>{
console.log("Servidor rodando porta "+PORT)
})