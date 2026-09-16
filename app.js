const form = document.getElementById("consultaForm");
const cnpjInput = document.getElementById("cnpj");
const msg = document.getElementById("msg");

// Máscara automática do CNPJ
cnpjInput.addEventListener("input", () => {
  let v = cnpjInput.value.replace(/\D/g, "").slice(0, 14);
  if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, "$1.$2.$3/$4-$5");
  else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, "$1.$2.$3/$4");
  else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{0,3}).*/, "$1.$2.$3");
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,3}).*/, "$1.$2");
  cnpjInput.value = v;
});

// Ação de envio da Consulta
form.addEventListener("submit", e => {
  e.preventDefault();
  msg.textContent = "Consultando...";
  
  const cnpjBuscado = cnpjInput.value.replace(/\D/g, "");
  const baseDemonstracao = JSON.parse(localStorage.getItem("baseDemonstracao") || "[]");
  
  const registrosEncontrados = baseDemonstracao.filter(item => item.cnpj === cnpjBuscado);
  
  if (registrosEncontrados.length === 0) {
    msg.textContent = "CNPJ não encontrado. Importe a planilha no painel administrativo primeiro.";
    return;
  }
  
  msg.textContent = "";
  
  const empresa = { 
    cnpj: cnpjInput.value, 
    nome: registrosEncontrados[0].nome || "Não informado" 
  };
  
  const pendencias = registrosEncontrados.map((item, index) => ({
    id: index + 1,
    competencia: item.competencia || "-",
    valor: item.valor,
    vencimento: item.vencimento || "-",
    situacao: item.situacao
  }));
  
  const data = { empresa, pendencias };
  localStorage.setItem('dadosEmpresaCNPJ360', JSON.stringify(data));
  window.location.href = 'pgmei.html';
});
