const express = require("express")
const sqlite3 = require("sqlite3").verbose()

const app = express()

app.use(express.json())

// banco
const db = new sqlite3.Database("./gastos.db", (err) => {
  if (err) {
    console.error("Erro banco:", err)
  } else {
    console.log("Banco conectado")
  }
})

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS gastos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT,
      valor REAL,
      data DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

// rota principal
app.get("/", (req, res) => {
  res.send("🚀 GastoZap ONLINE")
})

// listar gastos
app.get("/gastos", (req, res) => {

  db.all("SELECT * FROM gastos ORDER BY data DESC", (err, rows) => {

    if (err) {
      return res.status(500).json(err)
    }

    res.json(rows)
  })

})

// adicionar gasto
app.post("/gastos", (req, res) => {

  const { descricao, valor } = req.body

  db.run(
    "INSERT INTO gastos (descricao, valor) VALUES (?, ?)",
    [descricao, valor],
    function (err) {

      if (err) {
        return res.status(500).json(err)
      }

      res.json({
        id: this.lastID,
        descricao,
        valor
      })

    }
  )

})

const PORT = process.env.PORT

app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor rodando na porta", PORT)
})