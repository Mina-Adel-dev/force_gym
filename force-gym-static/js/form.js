// form.js
(function() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const goal = document.getElementById('goal').value.trim();

    if (!name || name.length < 2) {
      alert('Name must be at least 2 characters');
      return;
    }

    const phoneDigits = phone.replace(/\s+/g, '');
    if (!/^01[0-9]{9}$/.test(phoneDigits)) {
      alert('Please enter a valid Egyptian mobile number (11 digits starting with 01)');
      return;
    }

    const content = I18nModule.getContent();
    const messageTemplate = content.lead.whatsappMessage;
    const message = messageTemplate
      .replace('{name}', name)
      .replace('{phone}', phoneDigits)
      .replace('{goal}', goal || 'Not specified');
    
    const whatsappLink = content.whatsappLink || `https://wa.me/20${content.phone.slice(1)}`;
    const fullLink = `${whatsappLink}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(fullLink, '_blank');

    // Show toast
    const toastMsg = content.contact.successToast || 'Message sent (demo)';
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = toastMsg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);

    console.log({ name, phone: phoneDigits, goal, message });

    form.reset();
  });
})();