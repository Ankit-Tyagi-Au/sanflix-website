// ===== Mobile nav toggle =====
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }));
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

  // ===== Chatbot widget: simple keyword-matching assistant (no backend needed) =====
  const chatToggle = document.querySelector('.chat-toggle');
  const chatPanel = document.querySelector('.chat-panel');
  const chatBody = document.querySelector('.chat-body');
  const chatForm = document.querySelector('.chat-input');

  // Each entry: keywords to look for, and the answer to give if any keyword matches.
  // Checked in order, so more specific intents (like "whatsapp") are listed before general ones (like "contact").
  const CHAT_ANSWERS = [
    {
      keywords: ['whatsapp', 'whats app'],
      answer: "You can WhatsApp us directly at +91 81688 00195 — just tap the green WhatsApp button in the corner!"
    },
    {
      keywords: ['deliver', 'delivery', 'ship', 'area', 'location', 'available', 'city'],
      answer: "We're starting with a strong retail presence in one city and its surrounding areas in India, with plans to expand soon. Contact us to check availability in your area."
    },
    {
      keywords: ['launch', 'when are you', 'live'],
      answer: "Sanflix is launching soon in India! Get in touch through our Contact page to be among the first to know."
    },
    {
      keywords: ['product', 'products', 'sell', 'range', 'items'],
      answer: "We make a full range of home cleaning products: Toilet Cleaner, Floor Cleaner, Phenyl, Dishwash, Hand Wash and Glass Cleaner. Check out our Products page for details!"
    },
    {
      keywords: ['contact', 'reach', 'email', 'phone', 'call', 'get in touch'],
      answer: "You can reach us via WhatsApp, email at info@sanflix.in, or fill out our enquiry form on the Contact page — we usually reply within 1-2 business days."
    }
  ];

  const FALLBACK_ANSWER = "I can help with questions about our products, launch, delivery areas, or how to contact us. For anything else, please reach out via WhatsApp or our Contact page!";

  function getBotAnswer(userText) {
    const text = userText.toLowerCase();
    for (const entry of CHAT_ANSWERS) {
      if (entry.keywords.some(kw => text.includes(kw))) {
        return entry.answer;
      }
    }
    return FALLBACK_ANSWER;
  }

  if (chatToggle && chatPanel) {
    chatToggle.addEventListener('click', () => chatPanel.classList.toggle('open'));
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = chatForm.querySelector('input');
      const text = input.value.trim();
      if (!text) return;
      appendMsg(text, 'user');
      input.value = '';

      // Small delay so it feels like a natural reply rather than an instant canned response
      setTimeout(() => {
        appendMsg(getBotAnswer(text), 'bot');
      }, 400);
    });
  }

  function appendMsg(text, who) {
    const div = document.createElement('div');
    div.className = 'msg ' + who;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
});
