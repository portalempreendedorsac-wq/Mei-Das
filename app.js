const form = document.getElementById("consultaForm");
const cnpjInput = document.getElementById("cnpj");
const msg = document.getElementById("msg");

// Máscara para formatar o CNPJ automaticamente enquanto o usuário digita
cnpjInput.addEventListener("input", () => {
  let v = cnpjInput.value.replace(/\D/g, "").slice(0, 14);
  if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, "$1.$2.$3/$4-$5");
  else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, "$1.$2.$3/$4");
  else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{0,3}).*/, "$1.$2.$3");
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,3}).*/, "$1.$2");
  cnpjInput.value = v;
});

// Ação de envio do formulário de consulta
form.addEventListener("submit", async e => {
  e.preventDefault();
  msg.textContent = "Consultando...";
  
  try {
    const res = await fetch("/api/consulta", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cnpj: cnpjInput.value })
    });
    
    const data = await res.json();
    
    if (!res.ok) { 
      msg.textContent = data.error || "Erro na consulta."; 
      return; 
    }
    
    msg.textContent = "";
    renderResult(data);
  } catch (error) {
    msg.textContent = "Erro ao conectar com o servidor.";
  }
});

// Nova função que salva os dados e redireciona para a tela do PGMEI
function renderResult(data){
  // Salva os dados no navegador para que a página pgmei.html consiga ler
  localStorage.setItem('dadosEmpresaCNPJ360', JSON.stringify(data));
  
  // Redireciona o usuário para a nova tela
  window.location.href = 'pgmei.html';
}
