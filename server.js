const express = require("express")
const sqlite3 = require("sqlite3").verbose()

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())

// banco
const db = new sqlite3.Database("gastos.db", (err) => {
  if (err) {
    console.error("Erro banco:", err)
  } else {
    console.log("Banco conectado")
  }
})

db.run(`
CREATE TABLE IF NOT EXISTS gastos (
id INTEGER PRIMARY KEY AUTOINCREMENT,
descricao TEXT,
valor REAL,
data DATETIME DEFAULT CURRENT_TIMESTAMP
)
`)

// rota principal
app.get("/", (req, res) => {
  res.send("🚀 GastoZap rodando no Railway")
})

// listar gastos
app.get("/gastos", (req, res) => {
  db.all("SELECT * FROM gastos ORDER BY data DESC", (err, rows) => {
    if (err) {
      console.log(err)
      return res.status(500).json({ erro: "Erro banco" })
    }
    res.json(rows)
  })
})

// adicionar gasto
app.post("/gastos", (req, res) => {

  const descricao = req.body.descricao
  const valor = parseFloat(req.body.valor)

  if (!descricao || isNaN(valor)) {
    return res.json({ erro: "Dados inválidos" })
  }

  db.run(
    "INSERT INTO gastos (descricao, valor) VALUES (?, ?)",
    [descricao, valor],
    function (err) {

      if (err) {
        console.log(err)
        return res.status(500).json({ erro: "Erro ao salvar" })
      }

      res.json({
        sucesso: true,
        id: this.lastID
      })
    }
  )
})

app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor rodando porta", PORT)
})