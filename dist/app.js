'use strict';
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const services = {
  'Cut': ['骨格と髪の流れに合わせたカット。カウンセリング・シャンプー・ブローを含みます。', '¥6,600'],
  'Cut + Color': ['肌の色や普段の装いになじむカラーと、扱いやすいカットをご提案します。', '¥13,200'],
  'Cut + Perm': ['髪質に合わせたやわらかな動きを。カットとパーマを組み合わせたメニューです。', '¥14,300'],
  'Treatment': ['髪の状態に合わせた集中ケアで、やわらかな手触りとまとまりを整えます。', '¥4,400'],
  'Head Spa': ['シャンプーと穏やかな頭皮のケア。忙しい毎日に、30分の静かなひとときを。', '¥4,400']
};
let lastTrigger;
function openDialog(id, trigger) {
  const modal = document.getElementById(id);
  if (!modal) return;
  lastTrigger = trigger || document.activeElement;
  modal.showModal();
}
$$('[data-dialog]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.service) {
    const service = button.dataset.service;
    $('#menu-title').textContent = service;
    $('#menu-description').textContent = services[service][0];
    $('#menu-price').textContent = services[service][1];
    $('#booking-form').elements.service.value = service;
  }
  openDialog(button.dataset.dialog, button);
}));
$$('dialog').forEach(modal => {
  $$('[data-close]', modal).forEach(button => button.addEventListener('click', () => modal.close()));
  modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const rect = modal.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
  });
  modal.addEventListener('close', () => { if (lastTrigger?.isConnected) lastTrigger.focus({preventScroll: true}); });
});
$$('#navigation a').forEach(link => link.addEventListener('click', () => $('#navigation').close()));
$('#menu-book').addEventListener('click', () => {
  $('#menu-dialog').close();
  openDialog('booking-dialog', $(`[data-service="${$('#booking-form').elements.service.value}"]`));
});
const today = new Date(); today.setHours(0, 0, 0, 0);
const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const lastDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);
let monthOffset = 0;
const bookingForm = $('#booking-form');
bookingForm.elements.date.min = iso(today);
bookingForm.elements.date.max = iso(lastDate);
let initial = new Date(today);
if (initial.getDay() === 1) initial.setDate(initial.getDate() + 1);
bookingForm.elements.date.value = iso(initial);
function renderCalendar() {
  const first = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  $('#calendar-month').textContent = `${first.getFullYear()}.${String(first.getMonth() + 1).padStart(2, '0')}`;
  $('#month-prev').disabled = monthOffset === 0;
  $('#month-next').disabled = monthOffset === 2;
  const calendar = $('#calendar'); calendar.replaceChildren();
  ['SUN','MON','TUE','WED','THU','FRI','SAT'].forEach(day => { const cell = document.createElement('span'); cell.className = 'day-heading'; cell.textContent = day; calendar.append(cell); });
  for (let empty = 0; empty < first.getDay(); empty++) { const cell = document.createElement('span'); cell.setAttribute('aria-hidden','true'); calendar.append(cell); }
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  for (let day = 1; day <= days; day++) {
    const date = new Date(first.getFullYear(), first.getMonth(), day);
    const key = iso(date); const button = document.createElement('button'); button.type = 'button';
    button.className = 'day'; button.textContent = day;
    button.disabled = date < today || date.getDay() === 1;
    button.setAttribute('aria-label', `${date.getMonth() + 1}月${day}日${date.getDay() === 1 ? ' 定休日' : ' 予約体験'}`);
    if (+date === +today) { button.classList.add('today'); button.setAttribute('aria-current', 'date'); }
    if (key === bookingForm.elements.date.value) button.classList.add('selected');
    button.addEventListener('click', () => { bookingForm.elements.date.value = key; $('#booking-result').textContent = ''; renderCalendar(); openDialog('booking-dialog', $$('.day', calendar).find(cell => cell.textContent === String(day))); });
    calendar.append(button);
  }
}
$('#month-prev').addEventListener('click', () => { if (monthOffset > 0) monthOffset--; renderCalendar(); });
$('#month-next').addEventListener('click', () => { if (monthOffset < 2) monthOffset++; renderCalendar(); });
bookingForm.addEventListener('input', () => { $('#booking-result').textContent = ''; bookingForm.elements.date.setCustomValidity(''); });
bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(bookingForm); const date = new Date(`${data.get('date')}T00:00:00`);
  if (date.getDay() === 1) { bookingForm.elements.date.setCustomValidity('月曜日は定休日です。別の日をお選びください。'); bookingForm.elements.date.reportValidity(); return; }
  $('#booking-result').textContent = `${data.get('date')} ${data.get('time')} ／ ${data.get('service')} ${services[data.get('service')][1]}（税込）\n上記の内容を選択しました。デモのため予約は確定・送信されていません。`;
  renderCalendar();
});
$('#contact-form').addEventListener('submit', event => {
  event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const summary = $('#contact-summary'); summary.replaceChildren();
  [['type','お問い合わせ種別'],['name','お名前'],['email','メールアドレス'],['message','お問い合わせ内容']].forEach(([key, title]) => {
    const row = document.createElement('div'); row.className = 'summary-row'; const label = document.createElement('strong'); label.textContent = title;
    const value = document.createElement('p'); value.textContent = data.get(key); row.append(label, value); summary.append(row);
  });
  openDialog('contact-preview', $('button[type="submit"]', form));
});
renderCalendar();
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), {threshold: .08});
  $$('.reveal').forEach(item => observer.observe(item));
}
