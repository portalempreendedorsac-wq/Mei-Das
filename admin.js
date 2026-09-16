function login(){
  document.getElementById("login").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  loadAll();
}

function loadAll(){
  const base = JSON.parse(localStorage.getItem("baseDemonstracao") || "[]");
  const total = base.reduce((acc, curr) => acc + curr.valor, 0);
  
  document.getElementById("stats").innerHTML=`
    <div class="stat-box"><small>Registros carregados</small><strong>${base.length}</strong></div>
    <div class="stat-box"><small>Total pendente</small><strong>R$ ${total.toFixed(2).replace(".",",")}</strong></div>`;
    
  document.getElementById("table").innerHTML = base.map(x => `
    <tr>
      <td>${x.cnpj}</td>
      <td>${x.nome || "-"}</td>
      <td>${x.situacao}</td>
      <td>1</td>
      <td>R$ ${x.valor.toFixed(2).replace(".",",")}</td>
    </tr>`).join("");
}

document.getElementById("uploadForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const file = document.getElementById("arquivo").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
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
        situacao: getCol(["situação", "situacao", "status"]) || "Pendente"
      };
    }).filter(item => item.cnpj !== "");

    localStorage.setItem("baseDemonstracao", JSON.stringify(base));
    
    const m = document.getElementById("uploadMsg");
    m.style.color = "#15803d";
    m.textContent = `Importação concluída: ${base.length} registros salvos no navegador!`;
    loadAll();
  };
  reader.readAsArrayBuffer(file);
});
