const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken'); 

const app = express();
const SECRET_KEY = "minha_chave_secreta_super_segura"; 
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    // 1. Tabela de Usuários 
    db.run(`
        CREATE TABLE IF NOT EXISTS usuario (
            idusuario INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            cpf TEXT,
            tipo TEXT
        )
    `);

    // 2. Tabela de Vagas
    db.run(`
        CREATE TABLE IF NOT EXISTS vagas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT,
            empresa TEXT,
            categoria TEXT,
            salario TEXT,
            requisitos TEXT,
            beneficios TEXT,
            contato TEXT,
            descricao TEXT
        )
    `);

    // Recria admin e aluno se não existirem
    db.get("SELECT * FROM usuario WHERE email = 'admin@escola.com'", (err, row) => {
        if (!row) db.run("INSERT INTO usuario (email, cpf, tipo) VALUES (?, ?, ?)", ['admin@escola.com', '00000000000', 'admin']);
    });
    db.get("SELECT * FROM usuario WHERE email = 'aluno@escola.com'", (err, row) => {
        if (!row) db.run("INSERT INTO usuario (email, cpf, tipo) VALUES (?, ?, ?)", ['aluno@escola.com', '11111111111', 'aluno']);
    });
});

// --- ROTAS ---

// Rota de Login COM JWT
app.post("/login", (req, res) => {
    const { email, cpf } = req.body;
    db.get("SELECT * FROM usuario WHERE email = ? AND cpf = ?", [email, cpf], (err, row) => {
        if (err) return res.status(500).json({ erro: err.message });
        
        if (row) {
            // --- GERAR O TOKEN ---
            const token = jwt.sign(
                { id: row.idusuario, tipo: row.tipo }, // Dados dentro do token
                SECRET_KEY,                            // Chave secreta
                { expiresIn: '1h' }                    // Validade (1 hora)
            );

            res.json({ 
                mensagem: "Login realizado com sucesso", 
                token: token,       
                usuario: row 
            });
            // ------------------------------------------------
        } else {
            res.status(401).json({ mensagem: "Usuário ou senha inválidos" });
        }
    });
});

// 1. CADASTRAR VAGA 
app.post("/vagas", (req, res) => {
    const { titulo, empresa, categoria, salario, requisitos, beneficios, contato, descricao } = req.body;
    
    const sql = `INSERT INTO vagas (titulo, empresa, categoria, salario, requisitos, beneficios, contato, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [titulo, empresa, categoria, salario, requisitos, beneficios, contato, descricao], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Vaga cadastrada!", id: this.lastID });
    });
});

// 2. LISTAR TODAS AS VAGAS
app.get("/vagas", (req, res) => {
    db.all("SELECT * FROM vagas", [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

// 3. PEGAR UMA VAGA ESPECÍFICA
app.get("/vaga/:id", (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM vagas WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(row);
    });
});

// 4. DELETAR VAGA 
app.delete("/vagas/:id", (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM vagas WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Vaga deletada com sucesso!" });
    });
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000 COM JWT!"));