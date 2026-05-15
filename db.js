const mysql = require("mysql2");

const conexao = mysql.createConnection({

  host: "localhost",

  user: "root",

  password: "0000",

  database: "belle_piercer"

});

conexao.connect((erro) => {

  if(erro){
    console.log("Erro ao conectar");
    return;
  }

  console.log("MySQL conectado");
});

module.exports = conexao;