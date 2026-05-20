const formulario =
document.getElementById("formulario");

/* =========================
   CARREGAR JOIAS
========================= */

async function carregarJoias(){

  const resposta =
    await fetch ("https://isa-studio-backend.onrender.com/catalogo");

  const produtos =
    await resposta.json();

  const lista =
    document.getElementById("listaJoias");

  lista.innerHTML = "";

  produtos.forEach((produto) => {

    if(produto.categoria === "joia"){

      lista.innerHTML += `

      <div class="item">

        <img
          src="src="https://isa-studio-backend.onrender.com/uploads/${produto.imagem}"
          width="150"
        >

        <h3>${produto.nome}</h3>

        <p>R$ ${produto.preco}</p>

        <button onclick="excluirJoia(${produto.id})">
          Excluir
        </button>

      </div>

      `;
    }

  });

}

/* =========================
   EXCLUIR JOIA
========================= */

async function excluirJoia(id){

  const confirmar =
    confirm("Deseja excluir esta joia?");

  if(!confirmar){
    return;
  }

  await fetch(

  `https://isa-studio-backend.onrender.com/catalogo/${id}`,

  {
    method: "DELETE"
  }

);

  carregarJoias();
}

/* =========================
   SALVAR JOIA
========================= */

formulario.addEventListener(

  "submit",

  async (e) => {

    e.preventDefault();

    const dados =
      new FormData();

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

      "https://isa-studio-backend.onrender.com/catalogo",

      {
        method: "POST",
        body: dados
      }

    );

    alert("Produto cadastrado");

    carregarJoias();

  }

);

/* =========================
   INICIAR
========================= */

carregarJoias();