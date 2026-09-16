const form = document.getElementById("consultaForm");
const cnpjInput = document.getElementById("cnpj");
const msg = document.getElementById("msg");

form.addEventListener("submit", e => {
  e.preventDefault();
  msg.textContent = "Carregando dados...";
  
  const cnpjBuscado = cnpjInput.value.replace(/\D/g, "");
  const baseDemonstracao = JSON.parse(localStorage.getItem("baseDemonstracao") || "[]");
  
  // Procura o CNPJ na base carregada pela planilha
  const registrosEncontrados = baseDemonstracao.filter(item => item.cnpj === cnpjBuscado);
  
  if (registrosEncontrados.length === 0) {
    msg.textContent = "Aviso: Importe a planilha no Painel Administrativo primeiro para carregar este CNPJ.";
    return;
  }
  
  msg.textContent = "";
  
  const empresa = { 
    cnpj: cnpjInput.value, 
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
  window.location.href = 'pgmei.html';
});
