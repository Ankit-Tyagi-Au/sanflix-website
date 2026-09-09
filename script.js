// ===== Mobile nav toggle =====
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  // ===== FAQ accordion =====
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (q) q.addEventListener('click', () => item.classList.toggle('open'));
  });

  // ===== Enquiry form: show/hide fields based on enquiry type =====
  const typeSelect = document.getElementById('enquiry-type');
  const bizFields = document.getElementById('business-fields');
  if (typeSelect && bizFields) {
    const toggleBizFields = () => {
      bizFields.style.display = typeSelect.value === 'consumer' ? 'none' : 'block';
    };
    typeSelect.addEventListener('change', toggleBizFields);
    toggleBizFields();
  }

  // ===== Enquiry form: submit via AJAX so it never leaves the page (no back-button loop) =====
  const enquiryForm = document.getElementById('enquiry-form');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorMsg = document.getElementById('form-error');
      const successMsg = document.getElementById('form-success');
      errorMsg.style.display = 'none';
      const submitBtn = enquiryForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      try {
        const res = await fetch(enquiryForm.action, {
          method: 'POST',
          body: new FormData(enquiryForm),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          enquiryForm.style.display = 'none';
          successMsg.style.display = 'block';
        } else {
          throw new Error('Submission failed');
        }
      } catch (err) {
        errorMsg.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send enquiry';
      }
    });
  }

  // ===== Chatbot widget (placeholder — wire CHATBOT_API_URL to your deployed RAG API) =====
  const CHATBOT_API_URL = ''; // e.g. 'https://your-sanflix-chatbot.onrender.com/chat'

  const chatToggle = document.querySelector('.chat-toggle');
  const chatPanel = document.querySelector('.chat-panel');
  const chatBody = document.querySelector('.chat-body');
  const chatForm = document.querySelector('.chat-input');

  if (chatToggle && chatPanel) {
    chatToggle.addEventListener('click', () => chatPanel.classList.toggle('open'));
  }

  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = chatForm.querySelector('input');
      const text = input.value.trim();
      if (!text) return;
      appendMsg(text, 'user');
      input.value = '';

      if (!CHATBOT_API_URL) {
        appendMsg("Chatbot backend isn't connected yet — this is a placeholder. Once your RAG API is deployed, set CHATBOT_API_URL in script.js.", 'bot');
        return;
      }

      appendMsg('Thinking…', 'bot', true);
      try {
        const res = await fetch(CHATBOT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        replaceLastBotMsg(data.answer || "Sorry, I couldn't find an answer to that.");
      } catch (err) {
        replaceLastBotMsg("Sorry, something went wrong reaching the chatbot. Please try again shortly.");
      }
    });
  }

  function appendMsg(text, who) {
    const div = document.createElement('div');
    div.className = 'msg ' + who;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  function replaceLastBotMsg(text) {
    const msgs = chatBody.querySelectorAll('.msg.bot');
    const last = msgs[msgs.length - 1];
    if (last) last.textContent = text;
    chatBody.scrollTop = chatBody.scrollHeight;
  }
});
