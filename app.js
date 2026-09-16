const form = document.getElementById("consultaForm");
const cnpjInput = document.getElementById("cnpj");
const msg = document.getElementById("msg");

// Se houver um input de CNPJ na tela inicial (caso queira usar para testes)
if(form) {
  form.addEventListener("submit", e => {
    e.preventDefault();
    const cnpjBuscado = cnpjInput.value.replace(/\D/g, "");
    abrirCliente(cnpjBuscado);
  });
}

function abrirCliente(cnpjBuscado) {
  const baseDemonstracao = JSON.parse(localStorage.getItem("baseDemonstracao") || "[]");
  const registrosEncontrados = baseDemonstracao.filter(item => item.cnpj === cnpjBuscado);
  
  if (registrosEncontrados.length === 0) {
    if(msg) msg.textContent = "CNPJ não encontrado na base de dados.";
    return;
  }
  
  const empresa = { 
    cnpj: registrosEncontrados[0].cnpj, 
    nome: registrosEncontrados[0].nome || "Cliente Cadastrado" 
  };
  
  const pendencias = registrosEncontrados.map((item, index) => ({
    id: index + 1,
    competencia: item.competencia || "Atual",
    valor: item.valor,
    vencimento: item.vencimento || "20/09/2026",
    situacao: item.situacao || "Devedor"
  }));
  
  const data = { empresa, pendencias };
  localStorage.setItem('dadosEmpresaCNPJ360', JSON.stringify(data));
  
  // Redireciona para a tela do PGMEI passando o CNPJ na URL
  window.location.href = `pgmei.html?cnpj=${encodeURIComponent(empresa.cnpj)}`;
}
