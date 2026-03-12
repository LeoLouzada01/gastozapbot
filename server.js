const express = require("express")
const sqlite3 = require("sqlite3").verbose()

const app = express()

// PORTA DO RAILWAY
const PORT = process.env.PORT || 8080

app.use(express.json())

// BANCO
const db = new sqlite3.Database("./gastos.db", (err) => {
  if (err) {
    console.error("Erro ao conectar banco:", err)
  } else {
    console.log("Banco conectado")
  }
})

// CRIAR TABELA
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS gastos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT NOT NULL,
      valor REAL NOT NULL,
      data DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

// ROTA PRINCIPAL
app.get("/", (req, res) => {
  res.send("🚀 GastoZap ONLINE")
})

// LISTAR GASTOS
app.get("/gastos", (req, res) => {

  db.all(
    "SELECT * FROM gastos ORDER BY data DESC",
    [],
    (err, rows) => {

      if (err) {
        console.error(err)
        return res.status(500).json({ erro: "Erro ao buscar gastos" })
      }

      res.json(rows)
    }
  )
})

// ADICIONAR GASTO
app.post("/gastos", (req, res) => {

  const { descricao, valor } = req.body

  if (!descricao || !valor) {
    return res.status(400).json({ erro: "Descricao e valor obrigatorios" })
  }

  db.run(
    "INSERT INTO gastos (descricao, valor) VALUES (?, ?)",
    [descricao, valor],
    function (err) {

      if (err) {
        console.error(err)
        return res.status(500).json({ erro: "Erro ao inserir gasto" })
      }

      res.json({
        sucesso: true,
        id: this.lastID,
        descricao,
        valor
      })
    }
  )
})

// INICIAR SERVIDOR
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})