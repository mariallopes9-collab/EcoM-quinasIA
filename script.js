// ═══════ STATE ═══════
let currentMachineData = {
  imagemUrl: null, horasUso: 0, anoCompra: 0, periodoDia: '',
  anoMaquina: 0, potenciaKW: 0, modeloMaquina: '', tipoSelecionado: ''
};
let historicoMaquinas = [];
let currentPage = 'welcome';

// ═══════ UTILITÁRIOS ═══════
function mostrarPagina(pag) {
  ['pageWelcome','pagina1','pagina2','pagina3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const map = {welcome:'pageWelcome', pag1:'pagina1', pag2:'pagina2', pag3:'pagina3'};
  const target = document.getElementById(map[pag] || pag);
  if (target) { target.style.display = 'block'; target.className = 'page-section'; }
  currentPage = pag;
  atualizarSteps(pag);
  window.scrollTo({top:0,behavior:'smooth'});
}

function atualizarSteps(pag) {
  const order = ['welcome','pag1','pag2','pag3'];
  const idx = order.indexOf(pag);
  const stepIds = ['stepWelcome','step1','step2','step3'];
  const connIds = ['conn1','conn2','conn3'];
  stepIds.forEach((id,i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active','done');
    if (i === idx) el.classList.add('active');
    else if (i < idx) el.classList.add('done');
  });
  connIds.forEach((id,i) => {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('done'); if(i < idx) el.classList.add('done'); }
  });
}

function selecionarTipo(btn, tipo) {
  document.querySelectorAll('.btn-ghost[onclick^="selecionarTipo"]').forEach(b => {
    b.style.borderColor=''; b.style.color=''; b.style.background='';
  });
  btn.style.borderColor = 'var(--green)';
  btn.style.color = 'var(--green)';
  btn.style.background = 'rgba(52,211,153,0.08)';
  currentMachineData.tipoSelecionado = tipo;
}

// ═══════ HISTÓRICO LOCAL ═══════
function carregarHistoricoLocal() {
  try {
    const s = localStorage.getItem('ecoMaquinas_v2');
    if (s) historicoMaquinas = JSON.parse(s);
  } catch(e) { historicoMaquinas = []; }
  if (!historicoMaquinas.length) {
    historicoMaquinas = [
      { id:'M-1001', modelo:'Torno CNC Takumi X8', horasUso:14200, anoCompra:2012, potencia:18.5, descarbonizacaoKgCO2:12450, status:'alerta_manutencao', dataRegistro:'2025-01-10' },
      { id:'M-1002', modelo:'Fresadora Bridgeport V2', horasUso:6200, anoCompra:2019, potencia:11.2, descarbonizacaoKgCO2:5430, status:'normal', dataRegistro:'2025-02-01' },
      { id:'M-1003', modelo:'Prensa Hidráulica PH-50', horasUso:8900, anoCompra:2016, potencia:25.0, descarbonizacaoKgCO2:9870, status:'standby_recomendado', dataRegistro:'2025-01-20' }
    ];
    salvarHistoricoLocal();
  }
}
function salvarHistoricoLocal() {
  localStorage.setItem('ecoMaquinas_v2', JSON.stringify(historicoMaquinas));
}
function adicionarAoHistorico(modelo, horas, anoCompra, potencia, desc) {
  const id = 'M-' + (Math.floor(Math.random()*9000)+1000);
  let status = 'normal';
  if (horas > 12000) status = 'alerta_manutencao';
  else if (horas > 7000) status = 'standby_recomendado';
  historicoMaquinas.unshift({ id, modelo, horasUso:horas, anoCompra, potencia, descarbonizacaoKgCO2:desc, status, dataRegistro:new Date().toISOString().slice(0,10) });
  if (historicoMaquinas.length > 12) historicoMaquinas.pop();
  salvarHistoricoLocal();
}

// ═══════ ANÁLISE (PÁG 1 → 2) ═══════
function processarAnalise() {
  const horasUso  = parseFloat(document.getElementById('usoHoras').value);
  const anoCompra = parseInt(document.getElementById('anoCompra').value);
  const periodo   = document.getElementById('horasDia').value.trim();
  const anoAtual  = new Date().getFullYear();

  if (isNaN(horasUso) || horasUso < 0) {
    Swal.fire({ icon:'warning', title:'Horas inválidas', text:'Insira um número válido de horas de uso.', background:'#141f1a', color:'#e2ffe8', confirmButtonColor:'#10b981' });
    return;
  }
  if (isNaN(anoCompra) || anoCompra < 1950 || anoCompra > anoAtual) {
    Swal.fire({ icon:'warning', title:'Ano incorreto', text:'Insira um ano de compra válido.', background:'#141f1a', color:'#e2ffe8', confirmButtonColor:'#10b981' });
    return;
  }

  // loading
  document.getElementById('analyzeBtn').style.display = 'none';
  document.getElementById('loadingAnalyze').style.display = 'block';
  const bar = document.getElementById('loadingBarEl');
  let prog = 0;
  const interval = setInterval(() => {
    prog += Math.random() * 25;
    if (prog > 95) prog = 95;
    bar.style.width = prog + '%';
  }, 300);

  setTimeout(() => {
    clearInterval(interval);
    bar.style.width = '100%';

    // Simula IA
    const tipos = currentMachineData.tipoSelecionado || 'Torno';
    const modelos = {
      'Torno':     ['Torno CNC Multieixo TX-90', 'Torno Paralelo Pesado TP-400', 'Torno Revólver Romi R-300'],
      'Fresadora': ['Fresadora Vertical FV-25', 'Centro de Usinagem VMC-1100', 'Fresadora Universal FU-2'],
      'Prensa':    ['Prensa Hidráulica PH-80', 'Prensa Excêntrica PE-100', 'Prensa Pneumática PP-60'],
      'CNC':       ['Centro CNC VF-4 Haas', 'Torno CNC Mazak QT-350', 'Centro Multicorte CNC-5X']
    };
    const lista = modelos[tipos] || modelos['Torno'];
    const modelo = lista[Math.floor(Math.random()*lista.length)];
    const potencia = parseFloat((Math.random()*30+8).toFixed(1));
    const anoMaquina = Math.max(1990, anoCompra + Math.floor(Math.random()*3-1));

    currentMachineData = { ...currentMachineData, horasUso, anoCompra, periodoDia:periodo, anoMaquina, potenciaKW:potencia, modeloMaquina:modelo };

    const fileInput = document.getElementById('machineImage');
    const processarComImagem = (imgUrl) => {
      currentMachineData.imagemUrl = imgUrl;
      atualizarPagina2();
      atualizarPagina3ComHistorico();
      document.getElementById('loadingAnalyze').style.display = 'none';
      document.getElementById('analyzeBtn').style.display = 'block';
      bar.style.width = '0%';
      Swal.fire({
        icon:'success', title:'Análise concluída!',
        text:'Modelo identificado e emissões calculadas com sucesso.',
        background:'#141f1a', color:'#e2ffe8', confirmButtonColor:'#10b981',
        timer: 2000, showConfirmButton: false,
        toast: true, position: 'top-end'
      });
      mostrarPagina('pag2');
    };

    if (fileInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = e => processarComImagem(e.target.result);
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      processarComImagem(null);
    }
  }, 1800);
}

// ═══════ PÁGINA 2 — RESULTADOS ═══════
function atualizarPagina2() {
  const { horasUso:horas, potenciaKW:pot, anoMaquina, modeloMaquina:modelo, anoCompra, periodoDia:periodo, imagemUrl } = currentMachineData;
  const anoAtual = new Date().getFullYear();
  const idadeAnos = anoAtual - anoCompra;

  let horasDiarias = 8;
  if (periodo) {
    if (periodo.includes('-') || periodo.includes('às')) {
      const nums = periodo.match(/\d{1,2}/g);
      if (nums && nums.length >= 2) horasDiarias = Math.abs(parseInt(nums[1]||17) - parseInt(nums[0]||7)) || 8;
    } else {
      const n = periodo.match(/\d+/);
      if (n) horasDiarias = Math.min(parseInt(n[0])||8, 16);
    }
  }
  horasDiarias = Math.max(1, Math.min(horasDiarias, 16));

  const energiaTotal = pot * (horasDiarias * 250) * idadeAnos;
  const co2Kg = Math.round(energiaTotal * 0.35);
  const co2Saving = Math.round(co2Kg * 0.15);

  let sugestoes = [];
  if (horas > 10000) sugestoes.push('Manutenção preditiva obrigatória — tempo de uso acima de 10.000 horas.');
  if (pot > 22)      sugestoes.push('Instalar variador de frequência (VFD) para reduzir picos de consumo.');
  if (idadeAnos > 8) sugestoes.push('Substituição por modelo Classe A economiza até 30% de energia elétrica.');
  if (horasDiarias > 10) sugestoes.push('Programar desligamento automático durante paradas longas (>30 min).');
  if (horas > 7000)  sugestoes.push('Considerar interrupção em stand-by quando ociosa por mais de 20 minutos.');
  if (!sugestoes.length) sugestoes.push('Operação dentro dos parâmetros normais. Mantenha lubrificação em dia.');
  sugestoes.push('Integração com energia solar fotovoltaica pode reduzir emissões em até 40%.');

  const statusHoras = horas > 12000 ? 'red' : horas > 7000 ? 'amber' : 'green';
  const statusLabel = horas > 12000 ? 'Crítico' : horas > 7000 ? 'Atenção' : 'Normal';

  const imgHtml = imagemUrl ? `<img src="${imagemUrl}" style="max-width:100%; max-height:120px; border-radius:10px; margin-bottom:10px; display:block;">` : '';

  document.getElementById('resultadosPagina2').innerHTML = `
    <div class="insights-grid">
      <div class="insight-box green-accent">
        ${imgHtml}
        <div class="insight-label">Modelo Inferido (IA)</div>
        <div class="insight-value" style="font-size:1.1rem;">${modelo}</div>
        <div class="insight-desc">Fabricação estimada: ${anoMaquina} · Potência: ${pot} kW</div>
      </div>
      <div class="insight-box ${statusHoras === 'red' ? 'red-accent' : statusHoras === 'amber' ? 'amber-accent' : 'green-accent'}">
        <div class="insight-label">Horas de uso total</div>
        <div class="insight-value ${statusHoras}">${horas.toLocaleString('pt-BR')} h</div>
        <div class="insight-desc">Status: <span class="status-pill ${statusHoras === 'red' ? 'sp-crit' : statusHoras === 'amber' ? 'sp-warn' : 'sp-ok'}">${statusLabel}</span></div>
      </div>
      <div class="insight-box green-accent">
        <div class="insight-label">Dados Operacionais</div>
        <div class="insight-value" style="font-size:1rem;">${anoCompra} → ${anoAtual}</div>
        <div class="insight-desc">${idadeAnos} anos em operação · ${horasDiarias}h/dia estimado</div>
      </div>
    </div>

    <div class="co2-banner">
      <div>
        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text3); letter-spacing:0.8px; margin-bottom:4px;">Emissões Acumuladas Estimadas</div>
        <div style="display:flex; align-items:baseline; gap:8px;">
          <span class="co2-number">${(co2Kg/1000).toFixed(1)}</span>
          <span class="co2-unit">t CO₂eq</span>
        </div>
        <div class="co2-saving">Meta 15%: economizar ${(co2Saving/1000).toFixed(2)} t CO₂/ano</div>
      </div>
      <div class="co2-meta">
        Calculado com base em ${pot} kW · ${horasDiarias}h/dia · ${idadeAnos} anos de operação<br>
        Fator de emissão: 0,35 kgCO₂/kWh (média rede brasileira)
      </div>
    </div>

    <div class="result-cols">
      <div class="result-block amber-block">
        <div class="result-block-title">Recomendações de Melhoria</div>
        <ul class="suggestion-list">
          ${sugestoes.map(s=>`<li><span class="sug-dot"></span>${s}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  adicionarAoHistorico(modelo, horas, anoCompra, pot, co2Kg);
  atualizarPagina3ComHistorico();
}

// ═══════ PÁGINA 3 — PARQUE ═══════
function atualizarPagina3ComHistorico() {
  if (!historicoMaquinas.length) {
    document.getElementById('analiseSistemaContainer').innerHTML = `
      <div class="analyzing-state"><div style="font-size:1.5rem">📭</div>
      <div><div style="font-weight:600">Sem dados</div><div style="font-size:0.8rem;color:var(--text3)">Gere uma análise ou clique em Sincronizar.</div></div></div>`;
    return;
  }

  let alertas = [];
  let temCritico = false;
  let temWarn = false;

  historicoMaquinas.forEach(m => {
    if (m.horasUso > 12000) {
      alertas.push({ tipo:'red', titulo:'Conserto Urgente', texto:`${m.id} (${m.modelo}) — ${m.horasUso.toLocaleString('pt-BR')}h de uso. Intervenção imediata necessária.` });
      temCritico = true;
    } else if (m.horasUso > 7000) {
      alertas.push({ tipo:'amber', titulo:'Stand-by Recomendado', texto:`${m.id} — detectados períodos de inatividade. Ative o modo stand-by automático para reduzir consumo.` });
      temWarn = true;
    }
  });
  if (!alertas.length) alertas.push({ tipo:'green', titulo:'Parque Saudável', texto:'Todas as máquinas dentro dos parâmetros normais.' });

  const alertasHtml = alertas.map(a => `
    <div class="alert-bar ${a.tipo}">
      <div class="alert-icon">${a.tipo==='red'?'🔴':a.tipo==='amber'?'🟡':'🟢'}</div>
      <div><div class="alert-title">${a.titulo}</div><div class="alert-text">${a.texto}</div></div>
    </div>
  `).join('');

  const tabelaHtml = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin:1.5rem 0 0.8rem; flex-wrap:wrap; gap:8px;">
      <div style="font-family:var(--font2); font-weight:700; color:var(--text);">Máquinas Cadastradas <span style="background:rgba(52,211,153,0.1); color:var(--green); border-radius:20px; padding:2px 10px; font-size:0.75rem; margin-left:6px;">${historicoMaquinas.length}</span></div>
      <div style="font-size:0.72rem; color:var(--text3);">📎 Feed simulado Google Sheets</div>
    </div>
    <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Modelo</th>
          <th>Horas uso</th>
          <th>Potência</th>
          <th>CO₂ (kg)</th>
          <th>Status</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
        ${historicoMaquinas.slice(0,9).map(m => {
          const sp = m.horasUso > 12000 ? 'sp-crit' : m.horasUso > 7000 ? 'sp-warn' : 'sp-ok';
          const slabel = m.horasUso > 12000 ? 'Crítico' : m.horasUso > 7000 ? 'Stand-by' : 'Normal';
          let acao = '';
          if (m.horasUso > 12000) acao = `<button class="btn btn-danger" onclick="solicitarConserto('${m.id}')">🔧 Conserto</button>`;
          else if (m.horasUso > 7000) acao = `<button class="btn btn-warning" onclick="ativarStandby('${m.id}')">⏸ Stand-by</button>`;
          else acao = `<span class="status-pill sp-ok">✓ OK</span>`;
          return `<tr>
            <td><strong>${m.id}</strong></td>
            <td>${m.modelo}</td>
            <td>${m.horasUso.toLocaleString('pt-BR')} h</td>
            <td>${m.potencia} kW</td>
            <td>${m.descarbonizacaoKgCO2.toLocaleString('pt-BR')}</td>
            <td><span class="status-pill ${sp}">${slabel}</span></td>
            <td>${acao}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    </div>
  `;

  document.getElementById('analiseSistemaContainer').innerHTML = alertasHtml + tabelaHtml;
}

// ═══════ AÇÕES GLOBAIS ═══════
window.solicitarConserto = function(id) {
  Swal.fire({
    icon:'warning', title:`Conserto solicitado`, html:`Técnico será acionado para a máquina <strong>${id}</strong>.<br>Você receberá confirmação em breve.`,
    confirmButtonText:'Confirmar solicitação',
    background:'#141f1a', color:'#e2ffe8', confirmButtonColor:'#ef4444'
  });
};
window.ativarStandby = function(id) {
  Swal.fire({
    icon:'success', title:'Stand-by ativado', text:`Máquina ${id} entrará em modo de baixo consumo automaticamente.`,
    timer:2200, showConfirmButton:false,
    background:'#141f1a', color:'#e2ffe8'
  });
};

function simularNovosDadosSheets() {
  const novos = [
    { id:'M-'+Math.floor(Math.random()*900+100), modelo:'Torno Automático IA-Link', horasUso:13800, anoCompra:2012, potencia:23.7, descarbonizacaoKgCO2:16240, status:'alerta_manutencao', dataRegistro:new Date().toISOString().slice(0,10) },
    { id:'M-'+Math.floor(Math.random()*900+100), modelo:'Centro Usinagem VMC-800', horasUso:4500, anoCompra:2021, potencia:15.0, descarbonizacaoKgCO2:3980, status:'normal', dataRegistro:new Date().toISOString().slice(0,10) }
  ];
  novos.forEach(n => historicoMaquinas.unshift(n));
  if (historicoMaquinas.length > 14) historicoMaquinas.splice(14);
  salvarHistoricoLocal();
  atualizarPagina3ComHistorico();
  Swal.fire({
    icon:'success', title:'Sheets sincronizado!', text:`${novos.length} novos registros importados.`,
    toast:true, position:'top-end', timer:2000, showConfirmButton:false,
    background:'#141f1a', color:'#e2ffe8'
  });
}

// ═══════ UPLOAD IMAGE ═══════
document.getElementById('machineImage').addEventListener('change', function(e) {
  if (e.target.files && e.target.files[0]) {
    const reader = new FileReader();
    reader.onload = ev => {
      const prev = document.getElementById('imagePreview');
      prev.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
      currentMachineData.imagemUrl = ev.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});

// Drag & drop
const zone = document.getElementById('uploadZone');
zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
zone.addEventListener('drop', e => {
  e.preventDefault(); zone.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('image/')) {
    const dt = new DataTransfer(); dt.items.add(f);
    document.getElementById('machineImage').files = dt.files;
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('imagePreview').innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(f);
  }
});

// ═══════ EVENT LISTENERS ═══════
document.getElementById('btnIniciarDiagnostico').addEventListener('click', () => mostrarPagina('pag1'));
document.getElementById('btnVerDados').addEventListener('click', () => {
  if (historicoMaquinas.length) mostrarPagina('pag3');
  else Swal.fire({ icon:'info', title:'Sem dados ainda', text:'Gere uma análise na Etapa 1 primeiro.', background:'#141f1a', color:'#e2ffe8', confirmButtonColor:'#10b981' });
});
document.getElementById('btnVoltarWelcome').addEventListener('click', () => mostrarPagina('welcome'));
document.getElementById('btnVoltarPagina1').addEventListener('click', () => mostrarPagina('pag1'));
document.getElementById('btnIrPagina3').addEventListener('click', () => mostrarPagina('pag3'));
document.getElementById('btnVoltarPagina2Da3').addEventListener('click', () => mostrarPagina('pag2'));
document.getElementById('btnGerarAnalise').addEventListener('click', processarAnalise);
document.getElementById('simularGoogleSheets').addEventListener('click', simularNovosDadosSheets);

// ═══════ INIT ═══════
carregarHistoricoLocal();
mostrarPagina('welcome');
if (historicoMaquinas.length) atualizarPagina3ComHistorico();

function mostrarContato() {
  Swal.fire({
    title: 'Geração E',
    html: `
      <p><strong>Maria Luiza Amorim</strong> — 11 91185-0390</p>
      <p><strong>Yasmim Oliveira</strong> — 11 91339-4980</p>
      <p><strong>Pedro Tochi</strong> — 11 97870-9870</p>
      <p><strong>Gustavo Leoni</strong> — 11 98376-7922</p>
      <p><strong>João Victor</strong> — 11 99699-6705</p>
    `,
    icon: 'info',
    confirmButtonText: 'Fechar'
  });
}