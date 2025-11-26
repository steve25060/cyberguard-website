/* static/script.js
   Demo behaviours for CyberGuard site:
   - contact form submit (demo)
   - local draft save / restore
   - lightweight chat widget with backend try/fallback
   - accessible focus handling
*/

/* --------------------------
   Contact form (demo)
   -------------------------- */
function handleContactSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const payload = {
    name: (document.getElementById('name') || {}).value || '',
    email: (document.getElementById('email') || {}).value || '',
    company: (document.getElementById('company') || {}).value || '',
    interest: (document.getElementById('interest') || {}).value || '',
    message: (document.getElementById('message') || {}).value || ''
  };

  // Demo behaviour: log + friendly UI feedback.
  console.log('Contact payload (demo):', payload);

  // Simple accessible confirmation
  const nameForMsg = payload.name || 'there';
  alert(`Thanks ${nameForMsg} — we've received your request (demo). We'll follow up via email.`);

  // Optionally clear saved draft on submit
  try { localStorage.removeItem('cyberguard_contact_draft'); } catch (err) { /* ignore */ }
}

/* --------------------------
   Draft saving / restoring
   -------------------------- */
function saveDraft() {
  const draft = {
    name: (document.getElementById('name') || {}).value || '',
    email: (document.getElementById('email') || {}).value || '',
    company: (document.getElementById('company') || {}).value || '',
    interest: (document.getElementById('interest') || {}).value || '',
    message: (document.getElementById('message') || {}).value || ''
  };

  try {
    localStorage.setItem('cyberguard_contact_draft', JSON.stringify(draft));
    alert('Draft saved locally in your browser.');
  } catch (err) {
    console.warn('Could not save draft', err);
    alert('Unable to save draft (private mode or storage blocked).');
  }
}

function restoreDraftIfAny() {
  try {
    const raw = localStorage.getItem('cyberguard_contact_draft');
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.name) document.getElementById('name').value = d.name;
    if (d.email) document.getElementById('email').value = d.email;
    if (d.company) document.getElementById('company').value = d.company;
    if (d.interest) document.getElementById('interest').value = d.interest;
    if (d.message) document.getElementById('message').value = d.message;
  } catch (err) {
    // silent
  }
}

/* --------------------------
   Chat widget
   -------------------------- */

function openChat() {
  document.getElementById('chatWidget').style.display = 'block';
  let overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);
  overlay.style.display = 'block';
  document.getElementById('chatInput').focus();
}

function closeChat() {
  document.getElementById('chatWidget').style.display = 'none';
  let overlay = document.querySelector('.overlay');
  if (overlay) {
    overlay.remove();
  }
}

async function sendMessage(){
  const input=document.getElementById('chatInput');
  const msg=input.value.trim();
  if(!msg) return;
  appendMessage('user',msg);
  input.value='';
  // try backend first
  try{
    const res = await fetch('/api/assistant',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:msg, userId:'demo-user-1'})
    });
    if(res.ok){
      const data = await res.json();
      appendMessage('bot', data.reply || 'Sorry — no reply from assistant.');
    } else {
      const text = await res.text();
      console.warn('Assistant API error',text);
      appendMessage('bot', 'Sorry, the assistant is currently unavailable.');
    }
  }catch(err){
    console.warn('No backend available, using local fallback',err);
    appendMessage('bot', 'Sorry, the assistant is currently unavailable.');
  }
}

function appendMessage(who,text){
  const body=document.getElementById('chatBody');
  const div=document.createElement('div');
  div.className='chat-message '+(who==='user'?'user':'bot');
  div.textContent=text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}


/* --------------------------
   Page wiring
   -------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  restoreDraftIfAny();

  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      handleContactSubmit(e);
    });
  }
});