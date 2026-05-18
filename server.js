const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// LISTAR
app.get("/catalogo", (req, res) => {

  res.json([

    {
      nome: "Argola Titânio",
      preco: 45,
      categoria: "joia",
      imagem: "industrial.png"
    },

    {
      nome: "Clicker",
      preco: 60,
      categoria: "joia",
      imagem: "nostril.png"
    }

  ]);

});

// CADASTRAR
// CADASTRAR

app.post(

  "/catalogo",

  upload.single("imagem"),

  (req, res) => {

    const nome =
      req.body.nome;

    const preco =
      req.body.preco;

    const categoria =
      req.body.categoria.toLowerCase();

    const imagem =
      req.file.filename;

    db.query(

      `
      INSERT INTO catalogo
      (nome, preco, imagem, categoria)

      VALUES (?, ?, ?, ?)
      `,

      [
        nome,
        preco,
        imagem,
        categoria
      ],

      (erro) => {

        if(erro){

          return res
            .status(500)
            .json(erro);
        }

        res.json({

          mensagem:
          "Produto cadastrado"

        });

      }

    );

  }

);
// EDITAR
app.put("/catalogo/:id", (req, res) => {

  const { nome, preco } = req.body;

  db.query(
    "UPDATE catalogo SET nome=?, preco=? WHERE id=?",

    [nome, preco, req.params.id],

    (erro) => {

      if(erro){
        return res.status(500).json(erro);
      }

      res.json({ mensagem: "Atualizado" });
    }
  );
});
// DELETAR
app.delete("/catalogo/:id", (req, res) => {

  db.query(
    "DELETE FROM catalogo WHERE id=?",

    [req.params.id],

    (erro) => {

      if(erro){
        return res.status(500).json(erro);
      }

      res.json({ mensagem: "Deletado" });
    }
  );
});
app.listen(3000, () => {
  console.log("Servidor rodando");
});