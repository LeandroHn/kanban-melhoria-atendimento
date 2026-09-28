const initialCards = [
  {
    id:"SUP-001", title:"Criar base de respostas para dúvidas recorrentes",
    description:"Padronizar respostas para as 10 perguntas mais frequentes e reduzir o tempo médio de atendimento.",
    priority:"high", tags:["Suporte","Processo"], owner:"Ana", initials:"AN", due:"26/09", status:"backlog"
  },
  {
    id:"SUP-002", title:"Mapear principais motivos de contato",
    description:"Classificar tickets dos últimos 30 dias por motivo, volume e impacto no cliente.",
    priority:"medium", tags:["Dados","Suporte"], owner:"Bruno", initials:"BR", due:"27/09", status:"backlog"
  },
  {
    id:"SUP-003", title:"Criar checklist de triagem N1",
    description:"Definir perguntas e verificações mínimas antes de escalar um chamado para N2.",
    priority:"high", tags:["Suporte","QA"], owner:"Carlos", initials:"CA", due:"28/09", status:"todo"
  },
  {
    id:"SUP-004", title:"Testar novo fluxo de abertura de chamados",
    description:"Validar campos obrigatórios e cenários de erro antes da publicação do formulário.",
    priority:"high", tags:["QA","Processo"], owner:"Diego", initials:"DI", due:"29/09", status:"todo"
  },
  {
    id:"SUP-005", title:"Reduzir tempo de primeira resposta",
    description:"Analisar gargalos do SLA e propor uma regra de distribuição por prioridade.",
    priority:"medium", tags:["Suporte","SLA"], owner:"Ana", initials:"AN", due:"30/09", status:"doing"
  },
  {
    id:"SUP-006", title:"Automatizar classificação inicial dos tickets",
    description:"Criar uma prova de conceito para classificar solicitações por categoria.",
    priority:"medium", tags:["RPA","Dados"], owner:"Bruno", initials:"BR", due:"02/10", status:"doing"
  },
  {
    id:"SUP-007", title:"Documentar procedimento de escalonamento",
    description:"Registrar critérios para encaminhamento de incidentes entre N1, N2 e áreas especialistas.",
    priority:"low", tags:["Processo","Suporte"], owner:"Carlos", initials:"CA", due:"01/10", status:"doing"
  },
  {
    id:"SUP-008", title:"Revisar pesquisa de satisfação pós-atendimento",
    description:"Simplificar a pesquisa e definir indicadores para acompanhar CSAT.",
    priority:"low", tags:["CX","Dados"], owner:"Diego", initials:"DI", due:"25/09", status:"done"
  },
  {
    id:"SUP-009", title:"Criar painel de SLA e volume",
    description:"Dashboard com volume de tickets, SLA, backlog e tempo médio de atendimento.",
    priority:"medium", tags:["Dados","SLA"], owner:"Bruno", initials:"BR", due:"24/09", status:"done"
  }
];

let cards = JSON.parse(localStorage.getItem("kanbanCards")) || initialCards;
let activeFilter = "all";
let searchTerm = "";

const labels = {high:"Alta", medium:"Média", low:"Baixa"};

function save(){ localStorage.setItem("kanbanCards", JSON.stringify(cards)); }

function render(){
  document.querySelectorAll(".cards").forEach(zone => zone.innerHTML = "");
  const filtered = cards.filter(c => {
    const filterOK = activeFilter === "all" ||
      (activeFilter === "high" && c.priority === "high") ||
      c.tags.some(t => t.toLowerCase().includes(activeFilter));
    const text = `${c.title} ${c.description} ${c.owner} ${c.tags.join(" ")}`.toLowerCase();
    return filterOK && text.includes(searchTerm);
  });

  ["backlog","todo","doing","done"].forEach(status => {
    const zone = document.querySelector(`[data-dropzone="${status}"]`);
    const visible = filtered.filter(c => c.status === status);
    document.getElementById(`count-${status}`).textContent = cards.filter(c=>c.status===status).length;

    if(!visible.length){
      zone.innerHTML = `<div class="empty">Nenhum item encontrado</div>`;
    } else {
      visible.forEach(card => zone.appendChild(createCard(card)));
    }
  });

  const total = cards.length;
  const done = cards.filter(c=>c.status==="done").length;
  document.getElementById("totalItems").textContent = total;
  document.getElementById("highPriority").textContent = cards.filter(c=>c.priority==="high" && c.status!=="done").length;
  document.getElementById("inProgress").textContent = cards.filter(c=>c.status==="doing").length;
  document.getElementById("completionRate").textContent = `${Math.round(done/total*100)}%`;
  enableDragDrop();
}

function createCard(card){
  const el = document.createElement("article");
  el.className = "card";
  el.draggable = true;
  el.dataset.id = card.id;
  el.innerHTML = `
    <div class="card-top">
      <span class="priority ${card.priority}">${labels[card.priority]}</span>
      <span class="card-id">${card.id}</span>
    </div>
    <h4>${card.title}</h4>
    <p>${card.description}</p>
    <div class="tags">${card.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
    <div class="card-bottom">
      <div class="owner"><span class="avatar">${card.initials}</span>${card.owner}</div>
      <span class="due">Prazo ${card.due}</span>
    </div>`;
  return el;
}

function enableDragDrop(){
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", card.dataset.id);
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
  });

  document.querySelectorAll(".cards").forEach(zone => {
    zone.addEventListener("dragover", e => { e.preventDefault(); });
    zone.addEventListener("drop", e => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      const target = zone.dataset.dropzone;
      const card = cards.find(c => c.id === id);
      if(card){ card.status = target; save(); render(); }
    });
  });
}

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    render();
  });
});

document.getElementById("searchInput").addEventListener("input", e => {
  searchTerm = e.target.value.toLowerCase().trim();
  render();
});

document.getElementById("resetBoard").addEventListener("click", () => {
  cards = JSON.parse(JSON.stringify(initialCards));
  save();
  searchTerm = "";
  activeFilter = "all";
  document.getElementById("searchInput").value = "";
  document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active", b.dataset.filter==="all"));
  render();
});

render();
