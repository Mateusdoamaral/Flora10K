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
emailI.addEventListener('blur', ()=> showError(emailI, validateEmail(emailI.value) ? '' : 'E-mail inválido.'))

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nameV = nameI.value.trim();
  const emailV = emailI.e.trim();
  let ok = true;

  // Lógica de validação no front-end (continua a mesma)
  if (!nameV) { showError(nameI, 'Informe seu nome.'); ok = false; } else { showError(nameI, ''); }
  if (!validateEmail(emailV)) { showError(emailI, 'E-mail inválido.'); ok = false; } else { showError(emailI, ''); }
  if (!ok) return;

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Aguarde...';

  try {
    // A chamada para o nosso back-end!
    const response = await fetch('http://localhost:3001/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: nameV, email: emailV }),
    });

    if (!response.ok) {
      // Se o servidor responder com um erro (status 4xx ou 5xx)
      throw new Error('Houve um problema com a sua inscrição.');
    }

    // Se a resposta do servidor for positiva (status 2xx)
    toast.hidden = false;
    toast.textContent = 'Inscrição confirmada 🎉';
    setTimeout(() => { toast.hidden = true; }, 1800);

    // Redireciona para a página de obrigado
    setTimeout(() => {
      window.location.href = '/obrigado.html';
    }, 1500);

  } catch (error) {
    console.error('Fetch error:', error);
    toast.hidden = false;
    toast.textContent = 'Erro ao inscrever. Tente novamente mais tarde.';
    setTimeout(() => { toast.hidden = true; }, 2500);

    // Reabilita o botão em caso de erro
    submitButton.disabled = false;
    submitButton.textContent = 'Quero garantir minha vaga gratuita';
  }
});

// ===== Acessibilidade: foco inicial =====
window.addEventListener('load', ()=> nameI.focus());

//::contentReference[oaicite, 0]{index=0}
