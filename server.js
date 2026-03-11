const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const path = require("path")

const app = express()

app.use(express.json())
app.use(express.static("public"))

const db = new sqlite3.Database("./gastos.db")

db.serialize(()=>{

db.run(`
CREATE TABLE IF NOT EXISTS gastos(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 descricao TEXT,
 valor REAL,
 data TEXT
)
`)

})

app.get("/",(req,res)=>{
 res.send("GastoZap Online 🚀")
})

app.get("/api/gastos",(req,res)=>{

db.all("SELECT * FROM gastos",(err,rows)=>{

 if(err){
  res.json({erro:err})
 }else{
  res.json(rows)
 }

})

})

app.post("/api/gastos",(req,res)=>{

const {descricao,valor} = req.body

db.run(
"INSERT INTO gastos(descricao,valor,data) VALUES(?,?,datetime('now'))",
[descricao,valor],
function(err){

 if(err){
  res.json({erro:err})
 }else{
  res.json({ok:true})
 }

})

})

const PORT = process.env.PORT || 3000

app.listen(PORT,"0.0.0.0",()=>{
 console.log("Servidor rodando na porta "+PORT)
})