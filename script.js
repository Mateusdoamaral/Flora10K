// script.js

// ===== Util =====
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

// ===== Year =====
$('#year').textContent = new Date().getFullYear();

// ===== IntersectionObserver (revelar seções) =====
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
},{threshold:0.18});
$$('.observe').forEach(el=>io.observe(el));

// ===== Scroll helpers =====
const scrollToForm = () => $('#name').scrollIntoView({behavior:'smooth', block:'center'});
$$('.scroll-to-form').forEach(btn=>btn.addEventListener('click', scrollToForm));
$('#stickyCta').addEventListener('click', scrollToForm);

// ===== Countdown =====
const dateISO = '2025-09-11T19:30:00-03:00';
const target = new Date(dateISO).getTime();
function pad(n){return String(n).padStart(2,'0');}
function updateCountdown(){
  const now = Date.now();
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / (1000*60*60*24));
  const h = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
  const m = Math.floor((diff % (1000*60*60)) / (1000*60));
  const s = Math.floor((diff % (1000*60)) / 1000);

  const sets = [
    {d:'#cd-days', h:'#cd-hours', m:'#cd-minutes', s:'#cd-seconds'},
    {d:'#cd2-days', h:'#cd2-hours', m:'#cd2-minutes', s:'#cd2-seconds'}
  ];
  sets.forEach(sel=>{
    if($(sel.d)) { $(sel.d).textContent = pad(d); }
    if($(sel.h)) { $(sel.h).textContent = pad(h); }
    if($(sel.m)) { $(sel.m).textContent = pad(m); }
    if($(sel.s)) { $(sel.s).textContent = pad(s); }
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ===== Form Validation & Submit =====
const form = $('#leadForm');
const nameI = $('#name');
const emailI = $('#email');
const nameErr = $('#nameError');
const emailErr = $('#emailError');
const toast = $('#toast');

function validateEmail(v){
  // regex simples e permissiva
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v);
}

function showError(el, msg){
  const target = el === nameI ? nameErr : emailErr;
  target.textContent = msg || '';
  if(msg){ el.setAttribute('aria-invalid','true'); }
  else{ el.removeAttribute('aria-invalid'); }
}

nameI.addEventListener('blur', ()=> showError(nameI, nameI.value.trim() ? '' : 'Informe seu nome.'));
emailI.addEventListener('blur', ()=> showError(emailI, validateEmail(emailI.value) ? '' : 'E-mail inválido.'));

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const nameV = nameI.value.trim();
  const emailV = emailI.value.trim();
  let ok = true;

  if(!nameV){ showError(nameI, 'Informe seu nome.'); ok = false; } else { showError(nameI, ''); }
  if(!validateEmail(emailV)){ showError(emailI, 'E-mail inválido.'); ok = false; } else { showError(emailI, ''); }

  if(!ok) return;

  // salvar localmente
  try{
    localStorage.setItem('flora10k_name', nameV);
    localStorage.setItem('flora10k_email', emailV);
  }catch(_){}

  // Toast
  toast.hidden = false;
  toast.textContent = 'Inscrição confirmada 🎉';
  setTimeout(()=>{ toast.hidden = true; }, 1800);

  // Redirecionar (placeholder)
  setTimeout(()=>{
    // Trocar para a sua URL real de obrigado:
    window.location.href = '/obrigado.html'; // <-- substituir
  }, 1500);
});

// ===== Acessibilidade: foco inicial =====
window.addEventListener('load', ()=> nameI.focus());

//::contentReference[oaicite, 0]{index=0}
