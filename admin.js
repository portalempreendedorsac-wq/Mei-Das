function login(){
  document.getElementById("login").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  loadAll();
}

function loadAll(){
  const base = JSON.parse(localStorage.getItem("baseDemonstracao") || "[]");
  
  // Agrupa por CNPJ único para listar cada cliente apenas uma vez na tabela
  const unicos = {};
  base.forEach(item => {
    if(item.cnpj && !unicos[item.cnpj]) {
      unicos[item.cnpj] = item.nome || "Cliente sem Nome";
    }
  });

  const tbody = document.getElementById("table");
  const chaves = Object.keys(unicos);

  if(chaves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Nenhum cliente encontrado. Faça o upload da planilha acima.</td></tr>`;
    return;
  }

  tbody.innerHTML = chaves.map(cnpj => {
    const nome = unicos[cnpj];
    // Cria o link direto preenchendo o CNPJ na URL do pgmei.html
    const linkCliente = `pgmei.html?cnpj=${encodeURIComponent(cnpj)}`;
    return `
      <tr>
        <td><b>${cnpj}</b></td>
        <td><b>${nome}</b></td>
        <td>
          <a href="${linkCliente}" target="_blank" style="background: #008542; color: #ffcc29; padding: 6px 12px; border-radius: 4px; font-weight: bold; text-decoration: none; display: inline-block;">
            🔗 Abrir Tela do Cliente
          </a>
        </td>
      </tr>`;
  }).join("");
}

document.getElementById("uploadForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const file = document.getElementById("arquivo").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, {type: 'array'});
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet, {defval: ""});

      const base = json.map(row => {
        const getCol = (names) => {
          const key = Object.keys(row).find(k => names.includes(k.trim().toLowerCase()));
          return key ? row[key] : "";
        };
        return {
          cnpj: String(getCol(["cnpj"])).replace(/\D/g, ""),
          nome: getCol(["nome", "razão social", "razao social", "nome fantasia"]),
          competencia: getCol(["competência", "competencia", "periodo", "período"]),
          valor: parseFloat(String(getCol(["valor", "valor total"])).replace(/[^\d,.-]/g, "").replace(",", ".")) || 0,
          vencimento: getCol(["vencimento", "data de vencimento"]),
          situacao: getCol(["situação", "situacao", "status"]) || "Devedor"
        };
      }).filter(item => item.cnpj !== "");

      localStorage.setItem("baseDemonstracao", JSON.stringify(base));
      
      const m = document.getElementById("uploadMsg");
      m.style.color = "#008542";
      m.textContent = `Sucesso! ${base.length} registros importados. Veja os links gerados abaixo.`;
      loadAll();
    } catch (err) {
      alert("Erro ao ler o arquivo Excel. Verifique se o formato está correto.");
    }
  };
  reader.readAsArrayBuffer(file);
});
