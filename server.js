const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { Pool } = require("pg");
const { createClient } = require("@supabase/supabase-js"); // ADICIONADO: Cliente do Supabase Storage

const app = express();

/* =========================
   SUPABASE BANCO DE DADOS (PostgreSQL)
========================= */
const db = new Pool({
  connectionString: "postgresql://postgres.ayverxhlvhwoqpvrntqz:StudioIsa1901!@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

/* =========================
   SUPABASE STORAGE (UPLOAD DE IMAGENS)
========================= */
// IMPORTANTE: Substitua 'ayverxhlvhwoqpvrntqz' caso seu ID de projeto seja diferente do que está na URL acima
const SUPABASE_URL = "https://ayverxhlvhwoqpvrntqz.supabase.co"; // CORRIGIDO: Sem o /rest/v1/
const SUPABASE_KEY = "sb_publishable_q4C5iSgEGgHl4pJMafJMMg_tTO_cBKq"; 
const supabaseStorage = createClient(SUPABASE_URL, SUPABASE_KEY);


app.use(cors());
app.use(express.json());

// Mantemos essa linha para não quebrar a imagem de fundo do banner local se usar
app.use("/uploads", express.static("uploads"));

/* =========================
   MULTER (Alterado para memória ram para enviar direto pro Supabase)
========================= */
const storage = multer.memoryStorage(); 
const upload = multer({ storage });

/* =========================
   LISTAR (Permanece idêntico)
========================= */
app.get("/catalogo", async (req, res) => {
  try {
    const resultado = await db.query("SELECT * FROM catalogo");
    console.log(resultado.rows);
    res.json(resultado.rows);
  } catch(erro){
    console.log("ERRO NO GET:");
    console.log(erro);
    res.status(500).json({ erro: erro.message });
  }
});

/* =========================
   CADASTRAR (Alterado para fazer upload no Supabase Storage)
========================= */
app.post("/catalogo", upload.single("imagem"), async (req, res) => {
  try {
    const nome = req.body.nome;
    const preco = req.body.preco;
    const categoria = req.body.categoria.toLowerCase();
    const file = req.file;

    let urlFinalDaImagem = null;

    // Se o usuário enviou uma foto no cadastro...
    if (file) {
      // 1. Gera um nome único juntando a data com a extensão original (.png, .jpg)
      const nomeArquivo = `${Date.now()}${path.extname(file.originalname)}`;

      // 2. Envia o arquivo direto para o bucket 'joias' do Supabase Storage
      const { data, error: uploadError } = await supabaseStorage.storage
        .from("joias") // O nome do bucket público criado no Passo 1
        .upload(nomeArquivo, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // 3. Pega o link público definitivo gerado pelo Supabase
      const { data: publicUrlData } = supabaseStorage.storage
        .from("joias")
        .getPublicUrl(nomeArquivo);

      urlFinalDaImagem = publicUrlData.publicUrl;
    }

    // 4. Salva no banco de dados. Agora salvamos o LINK INTEIRO da imagem
    await db.query(
      `
      INSERT INTO catalogo (nome, preco, imagem, categoria)
      VALUES ($1, $2, $3, $4)
      `,
      [nome, preco, urlFinalDaImagem, categoria]
    );

    res.json({
      mensagem: "Produto cadastrado"
    });

  } catch(erro){
    console.log(erro);
    res.status(500).json({ erro: erro.message || erro });
  }
});

/* =========================
   EDITAR (Permanece idêntico)
========================= */
app.put("/catalogo/:id", async (req, res) => {
  try {
    const { nome, preco } = req.body;

    await db.query(
      `
      UPDATE catalogo
      SET nome=$1, preco=$2
      WHERE id=$3
      `,
      [nome, preco, req.params.id]
    );

    res.json({ mensagem: "Atualizado" });
  } catch (erro) {
    console.log(erro);
    res.status(500).json(erro);
  }
});

/* =========================
   DELETAR (Permanece idêntico)
========================= */
app.delete("/catalogo/:id", async (req, res) => {
  try {
    await db.query(
      `
      DELETE FROM catalogo
      WHERE id=$1
      `,
      [req.params.id]
    );

    res.json({ mensagem: "Deletado" });
  } catch (erro) {
    console.log(erro);
    res.status(500).json(erro);
  }
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});