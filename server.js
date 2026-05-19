const express = require("express");

const cors = require("cors");

const multer = require("multer");

const path = require("path");

const { Pool } = require("pg");

const app = express();

/* =========================
   SUPABASE
========================= */

const db = new Pool({

  connectionString:
  "postgresql://postgres.ayverxhlvhwoqpvrntqz:StudioIsa1901!@aws-1-us-east-1.pooler.supabase.com:6543/postgres",

  ssl: {
    rejectUnauthorized: false
  }

});

/* =========================
   CONFIG
========================= */

app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static("uploads")
);

/* =========================
   MULTER
========================= */

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {

    cb(
      null,
      Date.now() +
      path.extname(file.originalname)
    );
  }

});

const upload = multer({
  storage
});

/* =========================
   LISTAR
========================= */

app.get("/catalogo", async (req, res) => {

  try {

    const resultado =
      await db.query(
        "SELECT * FROM catalogo"
      );

    res.json(resultado.rows);

  } catch (erro) {

    console.log(erro);

    res.status(500).json(erro);
  }

});

/* =========================
   CADASTRAR
========================= */

app.post(

  "/catalogo",

  upload.single("imagem"),

  async (req, res) => {

    try {

      const nome =
        req.body.nome;

      const preco =
        req.body.preco;

      const categoria =
        req.body.categoria.toLowerCase();

      const imagem =
        req.file
        ? req.file.filename
        : null;

      await db.query(

        `
        INSERT INTO catalogo
        (nome, preco, imagem, categoria)

        VALUES ($1, $2, $3, $4)
        `,

        [
          nome,
          preco,
          imagem,
          categoria
        ]

      );

      res.json({
        mensagem:
        "Produto cadastrado"
      });

    } catch(erro){

      console.log(erro);

      res
        .status(500)
        .json(erro);
    }

  }

);

/* =========================
   EDITAR
========================= */

app.put(

  "/catalogo/:id",

  async (req, res) => {

    try {

      const {
        nome,
        preco
      } = req.body;

      await db.query(

        `
        UPDATE catalogo

        SET nome=$1,
        preco=$2

        WHERE id=$3
        `,

        [
          nome,
          preco,
          req.params.id
        ]

      );

      res.json({

        mensagem:
        "Atualizado"

      });

    } catch (erro) {

      console.log(erro);

      res.status(500).json(erro);
    }

  }

);

/* =========================
   DELETAR
========================= */

app.delete(

  "/catalogo/:id",

  async (req, res) => {

    try {

      await db.query(

        `
        DELETE FROM catalogo

        WHERE id=$1
        `,

        [req.params.id]

      );

      res.json({

        mensagem:
        "Deletado"

      });

    } catch (erro) {

      console.log(erro);

      res.status(500).json(erro);
    }

  }

);

/* =========================
   SERVER
========================= */

const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(

    "Servidor rodando na porta " +
    PORT

  );

});