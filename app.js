const DEFAULT_FX = 95.77;
let fx = DEFAULT_FX;

function signParts(n){
  return { sign: n < 0 ? '-' : '', value: Math.abs(n) };
}

function formatINR(n, plain=false){
  const {sign,value} = signParts(Number(n));
  if (plain || value < 100000){
    const decimals = value < 100 && !Number.isInteger(value) ? 2 : (value < 10 ? 2 : 0);
    return `${sign}₹${value.toLocaleString('en-IN',{maximumFractionDigits:decimals})}`;
  }
  if (value >= 10000000) return `${sign}₹${(value/10000000).toFixed(value>=100000000?1:2)} cr`;
  return `${sign}₹${(value/100000).toFixed(value>=1000000?1:2)} lakh`;
}

function formatUSD(n, plain=false){
  const {sign,value} = signParts(Number(n));
  if (plain || value < 1000) return `${sign}$${value.toLocaleString('en-US',{minimumFractionDigits:value<100?2:0,maximumFractionDigits:2})}`;
  if (value >= 1000000) return `${sign}$${(value/1000000).toFixed(value>=10000000?1:2)}M`;
  return `${sign}$${(value/1000).toFixed(value>=100000?1:2)}K`;
}

function moneyMarkup(inrText, usdText){
  return `<span class="money-inr">${inrText}</span><small class="money-usd">/ ${usdText}</small>`;
}

function dualFromINR(n, plain=false){
  return moneyMarkup(formatINR(n,plain), formatUSD(Number(n)/fx,plain));
}

function dualRange(low,high,plain=false){
  const inr = `${formatINR(low,plain)}–${formatINR(high,plain).replace(/^₹/,'')}`;
  const usd = `${formatUSD(Number(low)/fx,plain)}–${formatUSD(Number(high)/fx,plain).replace(/^\$/,'')}`;
  return moneyMarkup(inr,usd);
}

function dualFromUSD(usd, plain=false){
  const inr = Number(usd) * fx;
  return moneyMarkup(formatINR(inr,plain), formatUSD(usd,plain));
}

function renderMoney(){
  document.querySelectorAll('.money').forEach(el=>{
    const plain = el.dataset.plain === '1';
    if (el.dataset.low !== undefined && el.dataset.high !== undefined){
      el.innerHTML = dualRange(Number(el.dataset.low),Number(el.dataset.high),plain);
    } else if (el.dataset.usd !== undefined){
      el.innerHTML = dualFromUSD(Number(el.dataset.usd),plain);
    } else if (el.dataset.inr !== undefined){
      el.innerHTML = dualFromINR(Number(el.dataset.inr),plain);
    }
  });
  const hero = document.getElementById('fxHero');
  if(hero) hero.textContent = fx.toFixed(2);
}

function toggleMenu(force){
  const open = typeof force === 'boolean' ? force : !document.body.classList.contains('menu-open');
  document.body.classList.toggle('menu-open',open);
  const btn = document.querySelector('.menu-btn');
  if(btn) btn.setAttribute('aria-expanded',String(open));
}

function togglePresent(){
  document.body.classList.toggle('presentation');
  document.body.classList.toggle('presenting');
}

const coreMachinery = [
  {stage:'Receiving',machine:'Platform scale + SS receiving bins / crates',capacity:'5 t/day line',qty:'1 lot',low:100000,high:150000,priority:'Essential',note:'Receiving, batch control and hygienic handling.'},
  {stage:'Washing',machine:'Bubble / flume vegetable washer',capacity:'800–1,000 kg/h',qty:'1',low:385000,high:956000,priority:'Essential',note:'Current Indian listings range from ~₹3.85L to ₹9.56L depending on length, ozone and automation.'},
  {stage:'Inspection',machine:'SS inspection / sorting conveyor',capacity:'800–1,000 kg/h',qty:'1',low:53000,high:150000,priority:'Essential',note:'Allow higher end for food-grade SS304, lighting and worker stations.'},
  {stage:'Preparation',machine:'Root vegetable peeler',capacity:'500–900 kg/h',qty:'1',low:99000,high:250000,priority:'Essential',note:'For carrot/root crops; abrasive or drum type.'},
  {stage:'Preparation',machine:'Multipurpose slicer / dicer',capacity:'500–1,000 kg/h',qty:'1',low:125000,high:450000,priority:'Essential',note:'Select food-grade industrial model with slice, dice and julienne tooling.'},
  {stage:'Pre-treatment',machine:'Continuous steam blancher',capacity:'500–750 kg/h',qty:'1',low:400000,high:800000,priority:'Essential',note:'RFQ planning allowance; final price depends on residence time, steam source and cooling section.'},
  {stage:'Pre-treatment',machine:'SS pretreatment tanks + dosing system',capacity:'Batch / recipe based',qty:'1 lot',low:150000,high:300000,priority:'Essential',note:'For validated anti-browning / acid / salt pretreatments where required.'},
  {stage:'Dewatering',machine:'Centrifugal dewaterer / air-knife system',capacity:'500–750 kg/h',qty:'1',low:350000,high:500000,priority:'Essential',note:'Removes surface water before thermal drying to reduce dryer load.'},
  {stage:'Dehydration',machine:'5-stage continuous multi-pass belt dryer',capacity:'Sized ~350–400 kg water evaporation/h',qty:'1',low:2500000,high:4000000,priority:'Core machine',note:'Use vendor trial data; do not select only by claimed feed kg/h.'},
  {stage:'Heat system',machine:'Steam boiler / hot-air generator / heat exchanger package',capacity:'Matched to dryer + blancher',qty:'1',low:500000,high:1000000,priority:'Essential',note:'Final cost depends on LPG/PNG/biomass/steam/heat-pump design.'},
  {stage:'Post-drying',machine:'Cooling / conditioning conveyor or low-humidity cooling system',capacity:'Matched to dryer',qty:'1',low:150000,high:300000,priority:'Essential',note:'Prevents condensation and equalises moisture before packing.'},
  {stage:'Grading',machine:'Vibratory grader / food-grade sieve',capacity:'250–500 kg/h dry product',qty:'1',low:150000,high:300000,priority:'Essential',note:'For fines, size separation and finished-product consistency.'},
  {stage:'Food safety',machine:'Conveyor metal detector',capacity:'Matched to packing line',qty:'1',low:230000,high:580000,priority:'Essential',note:'Higher range allows better aperture, sensitivity and auto-reject configuration.'},
  {stage:'Packing',machine:'5–25 kg weigh filler + hot-sealing system',capacity:'~250 kg/h or higher',qty:'1',low:480000,high:1000000,priority:'Essential',note:'B2B export pack line; select SS contact parts and suitable barrier-bag sealing.'},
  {stage:'Coding',machine:'Batch / date / lot coder',capacity:'Packing-line matched',qty:'1',low:50000,high:100000,priority:'Essential',note:'Inkjet or thermal-transfer depending on pack material.'},
  {stage:'Secondary packing',machine:'Carton sealer + strapping machine',capacity:'Packing-line matched',qty:'1 set',low:100000,high:200000,priority:'Essential',note:'For export master cartons.'},
  {stage:'Dispatch',machine:'Pallet stretch wrapper',capacity:'1–2 t/load',qty:'1',low:210000,high:340000,priority:'Essential',note:'Current Indian market examples ~₹2.1L–₹3.4L.'},
  {stage:'Handling',machine:'SS tables, bins, racks and trolleys',capacity:'Plant-wide',qty:'1 lot',low:250000,high:400000,priority:'Essential',note:'Food-contact SS304 where applicable.'},
  {stage:'QA',machine:'QC lab package',capacity:'Moisture, aw, pH, weighing, sieve tests',qty:'1 lot',low:300000,high:500000,priority:'Essential',note:'Microbiology / residues can initially be outsourced to accredited labs.'}
];

const optionalMachinery = [
  {stage:'Washing',machine:'Root / brush washer',capacity:'800–1,000 kg/h',qty:'1',low:200000,high:400000,priority:'Phase 2',note:'Add if carrot/root volume justifies a dedicated line.'},
  {stage:'Beans',machine:'Bean top-tail / cutting machine',capacity:'~500 kg/h',qty:'1',low:100000,high:200000,priority:'SKU-specific',note:'Can initially be semi-manual if bean volume is low.'},
  {stage:'Corn',machine:'Corn dehusker / sheller',capacity:'500–750 kg/h',qty:'1',low:65000,high:270000,priority:'SKU-specific',note:'Current Indian sheller benchmarks vary widely by duty and automation.'},
  {stage:'Mushroom',machine:'Industrial mushroom slicer',capacity:'~500 kg/h',qty:'1',low:450000,high:550000,priority:'SKU-specific',note:'Current 500 kg/h market listing around ₹5L.'},
  {stage:'Powder line',machine:'Pulverizer + vibro sifter',capacity:'100–250 kg/h dry',qty:'1 set',low:200000,high:400000,priority:'Optional',note:'Only needed if selling powders rather than slices/dice/flakes.'},
  {stage:'Sorting',machine:'Optical colour sorter',capacity:'Dry-product matched',qty:'1',low:800000,high:2000000,priority:'Phase 2',note:'Useful for premium export grade once volume supports the investment.'},
  {stage:'Cold chain',machine:'Raw-material walk-in cold room',capacity:'Approx. 15–20 MT',qty:'1',low:800000,high:1500000,priority:'Support',note:'Budget depends on temperature, redundancy, panels and refrigeration package.'},
  {stage:'Material handling',machine:'2–3 t forklift',capacity:'Warehouse / container handling',qty:'1',low:800000,high:1200000,priority:'Support',note:'Lease or used-equipment option can reduce Phase-1 CAPEX.'},
  {stage:'Utilities',machine:'Air compressor package',capacity:'Plant-wide',qty:'1',low:100000,high:200000,priority:'Support',note:'Size after final pneumatic-load schedule.'},
  {stage:'Utilities',machine:'Water treatment + basic ETP package',capacity:'Site-specific',qty:'1',low:400000,high:800000,priority:'Support',note:'Final design depends on water quality, discharge route and consent conditions.'}
];

function machineryRows(items){
  return items.map(r=>`<tr>
    <td><span class="mach-stage">${r.stage}</span></td>
    <td><strong>${r.machine}</strong><small class="mach-note">${r.note}</small></td>
    <td>${r.capacity}</td>
    <td>${r.qty}</td>
    <td><span class="money" data-low="${r.low}" data-high="${r.high}"></span></td>
    <td><span class="mach-priority">${r.priority}</span></td>
  </tr>`).join('');
}

function injectMachinerySchedule(){
  const capex = document.getElementById('capex');
  if(!capex || document.getElementById('machinery-cost-schedule')) return;
  const block = document.createElement('div');
  block.id = 'machinery-cost-schedule';
  block.className = 'machinery-schedule top-gap';
  block.innerHTML = `
    <div class="section-label">07A / Machinery cost schedule</div>
    <h3 class="display small">Machine-by-machine <span class="accent">procurement budget.</span></h3>
    <p class="lede">Indicative September 2026 planning ranges for a 5-tonne/day fresh-input dehydration plant. Values are shown in INR and USD using the study FX rate. GST, freight, civil works, installation and commissioning may be extra unless a supplier quotation states otherwise.</p>
    <div class="market-stat-grid machinery-summary">
      <article class="card glow"><div class="kicker">Core Phase-1 equipment</div><div class="fact-number money" data-low="6582000" data-high="12276000"></div><div class="fact-label">essential process, packing, handling and QA equipment</div><div class="badge assumption">Planning range</div></article>
      <article class="card"><div class="kicker">Optional / support additions</div><div class="fact-number money" data-low="3915000" data-high="7520000"></div><div class="fact-label">SKU-specific machines, cold room, forklift and utilities</div><div class="badge assumption">Add selectively</div></article>
      <article class="card"><div class="kicker">Core + all listed additions</div><div class="fact-number money" data-low="10497000" data-high="19796000"></div><div class="fact-label">not a recommendation to purchase every item on day one</div><div class="badge assumption">Upper procurement envelope</div></article>
    </div>
    <div class="chart-card top-gap">
      <div class="chart-head"><div><div class="kicker">Phase 1</div><h3>Core machinery</h3></div><span class="badge verified">19 line items</span></div>
      <div class="scenario-table-wrap machinery-table-wrap"><table class="machinery-table">
        <thead><tr><th>Stage</th><th>Machinery</th><th>Suggested capacity</th><th>Qty</th><th>Indicative unit price · INR + USD</th><th>Priority</th></tr></thead>
        <tbody>${machineryRows(coreMachinery)}</tbody>
      </table></div>
    </div>
    <div class="chart-card top-gap">
      <div class="chart-head"><div><div class="kicker">Expansion / support</div><h3>Optional and SKU-specific equipment</h3></div><span class="badge assumption">Buy only when justified</span></div>
      <div class="scenario-table-wrap machinery-table-wrap"><table class="machinery-table">
        <thead><tr><th>Stage</th><th>Machinery</th><th>Suggested capacity</th><th>Qty</th><th>Indicative unit price · INR + USD</th><th>Priority</th></tr></thead>
        <tbody>${machineryRows(optionalMachinery)}</tbody>
      </table></div>
    </div>
    <div class="warning top-gap"><strong>Procurement rule:</strong> the continuous dryer should be quoted against <strong>water evaporation capacity</strong> and actual trial data for the six vegetables, not only vendor-stated fresh-feed kg/h. Obtain at least three technically comparable RFQs before revising the bankable CAPEX.</div>
    <div class="source-strip">
      <strong>2026 market benchmarks used:</strong>
      <a href="https://www.procutmachines.in/vegetable-fruit-bubble-washer.html" target="_blank" rel="noopener">Bubble washer</a>
      <a href="https://www.tradeindia.com/products/auto-rotating-drum-peeling-machine-8776278.html" target="_blank" rel="noopener">Peeler</a>
      <a href="https://www.aajjo.com/product/multi-function-root-vegetable-cutting-machine-capacity-500-kghr-in-pune-a-m-technology-and-engineering-llp" target="_blank" rel="noopener">Slicer / dicer</a>
      <a href="https://www.dodiadryotech.com/continuous-type-vegetable-dryer-8226475.html" target="_blank" rel="noopener">Continuous dryer</a>
      <a href="https://www.tradeindia.com/products/food-metal-detector-conveyor-c10914407.html" target="_blank" rel="noopener">Metal detector</a>
      <a href="https://www.tradeindia.com/products/25-kg-bag-filling-and-hot-sealing-machine-c3561607.html" target="_blank" rel="noopener">Bag filler / sealer</a>
      <a href="https://www.13sqft.com/product/pallet-stretch-wrapping-machine-gx5rbdc5ceyc" target="_blank" rel="noopener">Pallet wrapper</a>
      <a href="https://rinac.com/blog/cold-room-india-2026-buyers-guide/" target="_blank" rel="noopener">Cold room</a>
    </div>`;
  capex.appendChild(block);

  const style = document.createElement('style');
  style.textContent = `
    .machinery-schedule{margin-top:52px;padding-top:38px;border-top:1px solid rgba(201,154,60,.28)}
    .machinery-table{min-width:1120px}
    .machinery-table th:nth-child(1){width:10%}
    .machinery-table th:nth-child(2){width:30%}
    .machinery-table th:nth-child(3){width:18%}
    .machinery-table th:nth-child(4){width:7%}
    .machinery-table th:nth-child(5){width:23%}
    .machinery-table th:nth-child(6){width:12%}
    .machinery-table td{vertical-align:top}
    .mach-note{display:block;margin-top:7px;line-height:1.45;opacity:.68;font-size:.78rem}
    .mach-stage{font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--gold,#c99a3c);font-weight:700}
    .mach-priority{display:inline-flex;padding:5px 8px;border:1px solid rgba(201,154,60,.35);border-radius:999px;font-size:.7rem;white-space:nowrap}
    .source-strip{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;margin-top:18px;font-size:.78rem;line-height:1.5;opacity:.82}
    .source-strip a{color:var(--gold-hi,#f2cf7a);text-decoration:none;border-bottom:1px solid rgba(242,207,122,.35)}
    .machinery-summary .fact-number{font-size:clamp(1.35rem,2.8vw,2.15rem)}
    @media(max-width:760px){
      .machinery-schedule{margin-top:36px;padding-top:28px}
      .machinery-table{min-width:980px}
      .machinery-table-wrap{margin-inline:-4px}
      .machinery-summary{grid-template-columns:1fr}
    }
  `;
  document.head.appendChild(style);
}

const fxInput = document.getElementById('fxRate');
if(fxInput){
  fxInput.value = DEFAULT_FX.toFixed(2);
  fxInput.addEventListener('input',()=>{
    const candidate = Number(fxInput.value);
    if(Number.isFinite(candidate) && candidate > 0){
      fx = candidate;
      renderMoney();
    }
  });
}

document.querySelectorAll('.nav a').forEach(link=>link.addEventListener('click',()=>toggleMenu(false)));

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav a')];
if('IntersectionObserver' in window){
  const observer = new IntersectionObserver(entries=>{
    const visible = entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible) return;
    navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${visible.target.id}`));
  },{rootMargin:'-20% 0px -65% 0px',threshold:[0,.15,.35]});
  sections.forEach(s=>observer.observe(s));
}

injectMachinerySchedule();
renderMoney();
