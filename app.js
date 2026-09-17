const DEFAULT_FX = 95.89;
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

function dualFromINR(n, plain=false){
  return `${formatINR(n,plain)} <small>/ ${formatUSD(Number(n)/fx,plain)}</small>`;
}

function dualRange(low,high,plain=false){
  return `${formatINR(low,plain)}–${formatINR(high,plain).replace(/^₹/,'')} <small>/ ${formatUSD(Number(low)/fx,plain)}–${formatUSD(Number(high)/fx,plain).replace(/^\$/,'')}</small>`;
}

function dualFromUSD(usd, plain=false){
  const inr = Number(usd) * fx;
  return `${formatINR(inr,plain)} <small>/ ${formatUSD(usd,plain)}</small>`;
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
}

const fxInput = document.getElementById('fxRate');
if(fxInput){
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

renderMoney();
