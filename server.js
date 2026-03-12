const express = require("express")
const sqlite3 = require("sqlite3").verbose()

const app = express()
const PORT = process.env.PORT || 8080

// banco
const db = new sqlite3.Database("gastos.db")

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

app.use(express.json())

// rota principal
app.get("/", (req, res) => {
  res.send("🚀 GastoZap rodando no Railway")
})

// listar gastos
app.get("/gastos", (req, res) => {
  db.all("SELECT * FROM gastos ORDER BY data DESC", (err, rows) => {
    if (err) return res.status(500).json(err)
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
      if (err) return res.status(500).json(err)

      res.json({
        id: this.lastID,
        descricao,
        valor,
      })
    }
  )
})

app.listen(PORT, () => {
  console.log("Servidor rodando porta", PORT)
})