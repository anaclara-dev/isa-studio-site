const formulario =
document.getElementById("formulario");

formulario.addEventListener(

  "submit",

  async (e) => {

    e.preventDefault();

    const dados = new FormData();

    dados.append(
      "nome",
      document.getElementById("nome").value
    );

    dados.append(
      "preco",
      document.getElementById("preco").value
    );

    dados.append(
      "categoria",
      document.getElementById("categoria").value
    );

    dados.append(
      "imagem",
      document.getElementById("imagem").files[0]
    );

    await fetch(
      "http://localhost:3000/catalogo",

      {
        method: "POST",
        body: dados
      }
    );

    alert("Produto cadastrado");
  }
);