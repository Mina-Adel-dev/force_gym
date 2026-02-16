// form.js
(function() {
  // Membership form
  const membershipForm = document.getElementById('membershipForm');
  if (membershipForm) {
    membershipForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('req-name').value.trim();
      const phone = document.getElementById('req-phone').value.trim();
      const planIndex = document.getElementById('req-plan').value;
      const note = document.getElementById('req-note').value.trim();

      if (!name || name.length < 2) {
        alert('Name must be at least 2 characters');
        return;
      }
      const phoneDigits = phone.replace(/\s+/g, '');
      if (!/^01[0-9]{9}$/.test(phoneDigits)) {
        alert('Please enter a valid Egyptian mobile number (11 digits starting with 01)');
        return;
      }
      if (!planIndex) {
        alert('Please select a plan');
        return;
      }

      const content = I18nModule.getContent();
      const plans = window.membershipPlans || [];
      const selectedPlan = plans[planIndex] ? plans[planIndex].name : '';

      const message = `Hi Force Gym, I'm interested in the membership offer.\nName: ${name}\nPhone: ${phoneDigits}\nPlan: ${selectedPlan}\nNote: ${note || 'None'}`;
      
      const whatsappLink = content.whatsappLink || 'https://wa.me/201112622236';
      window.open(`${whatsappLink}?text=${encodeURIComponent(message)}`, '_blank');

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = content.membership.requestForm.successToast || 'Opening WhatsApp...';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    });
  }

  // Original contact form (keep existing)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
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

      window.open(fullLink, '_blank');

      const toastMsg = content.contact.successToast || 'Message sent (demo)';
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = toastMsg;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      console.log({ name, phone: phoneDigits, goal, message });

      form.reset();
    });
  }
})();