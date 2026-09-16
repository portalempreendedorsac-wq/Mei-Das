function login(){
  document.getElementById("login").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  loadAll();
}

function loadAll(){
  const base = JSON.parse(localStorage.getItem("baseDemonstracao") || "[]");
  const unicos = {};
  base.forEach(item => {
    if(item.cnpj && !unicos[item.cnpj]) {
      unicos[item.cnpj] = { nome: item.nome || "Cliente", abertura: item.dataAbertura || "01/01/2026" };
    }
  });

  const tbody = document.getElementById("table");
  const chaves = Object.keys(unicos);

  if(chaves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Nenhum cliente encontrado. Faça o upload da planilha.</td></tr>`;
    return;
  }

  tbody.innerHTML = chaves.map(cnpj => {
    const dados = unicos[cnpj];
    const linkCliente = `pgmei.html?cnpj=${encodeURIComponent(cnpj)}`;
    return `
      <tr>
        <td><b>${cnpj}</b></td>
        <td><b>${dados.nome}</b><br><small style="color:#666;">Abertura: ${dados.abertura}</small></td>
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
          dataAbertura: getCol(["data abertura", "abertura", "data de abertura"]) || "01/01/2026",
          competencia: getCol(["competência", "competencia", "periodo", "período"]),
          valor: parseFloat(String(getCol(["valor", "valor total"])).replace(/[^\d,.-]/g, "").replace(",", ".")) || 86.05,
          vencimento: getCol(["vencimento", "data de vencimento"]),
          situacao: getCol(["situação", "situacao", "status"]) || "Devedor"
        };
      }).filter(item => item.cnpj !== "");

      localStorage.setItem("baseDemonstracao", JSON.stringify(base));
      
      const m = document.getElementById("uploadMsg");
      m.style.color = "#008542";
      m.textContent = `Sucesso! ${base.length} registros importados.`;
      loadAll();
    } catch (err) {
      alert("Erro ao ler o arquivo Excel.");
    }
  };
  reader.readAsArrayBuffer(file);
});
