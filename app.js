let mode = 'talk';
let history = [];
const messages = document.getElementById('messages');
const input = document.getElementById('input');
const send = document.getElementById('send');

function addBubble(text, who='ai') {
  const el = document.createElement('div');
  el.className = `bubble ${who}`;
  const p = document.createElement('p');
  p.textContent = text;
  const label = document.createElement('span');
  label.textContent = who === 'ai' ? 'MindBridge' : 'You';
  el.append(p, label);
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

document.querySelectorAll('.mode').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.mode').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  mode = btn.dataset.mode;
  const prompts = {talk:'Tell me what is on your mind...', say:'What are you trying to say, and who is it for?', think:'What problem are you trying to untangle?'};
  input.placeholder = prompts[mode];
  input.focus();
}));

async function submit() {
  const text = input.value.trim();
  if (!text || send.disabled) return;
  addBubble(text, 'user');
  history.push({role:'user', content:text});
  input.value = '';
  send.disabled = true;
  send.textContent = 'Thinking…';
  try {
    const r = await fetch('/api/chat', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:text, mode, history})});
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Request failed');
    addBubble(data.reply || 'I’m here. Let’s take this one step at a time.');
    history.push({role:'assistant', content:data.reply || ''});
  } catch (e) {
    addBubble('I could not connect to the AI service just now. Please try again in a moment.');
  } finally {
    send.disabled = false;
    send.textContent = 'Send ↑';
    input.focus();
  }
}

send.addEventListener('click', submit);
input.addEventListener('keydown', e => { if(e.key === 'Enter' && !e.shiftKey){e.preventDefault();submit();} });
document.getElementById('clear').addEventListener('click', () => {
  history=[];
  messages.innerHTML='<div class="bubble ai"><p>New conversation. You can start wherever feels easiest.</p><span>MindBridge</span></div>';
});
