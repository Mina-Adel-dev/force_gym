// auth.js - Handles signin and signup forms
(function() {
  // Password visibility toggle
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', function() {
      const wrapper = this.closest('.password-input-wrapper');
      const input = wrapper.querySelector('input');
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      this.textContent = type === 'password' 
        ? (I18nModule.getContent()?.auth?.signin?.showPassword || 'Show')
        : (I18nModule.getContent()?.auth?.signin?.hidePassword || 'Hide');
    });
  });

  // Sign In form
  const signinForm = document.getElementById('signinForm');
  if (signinForm) {
    signinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const identifier = document.getElementById('identifier').value.trim();
      const password = document.getElementById('password').value;

      if (!identifier) {
        alert(I18nModule.getContent()?.auth?.errors?.phoneInvalid || 'Please enter phone or email');
        return;
      }
      if (password.length < 8) {
        alert(I18nModule.getContent()?.auth?.errors?.passwordMin || 'Password must be at least 8 characters');
        return;
      }

      const content = I18nModule.getContent();
      const message = content.auth.signin.whatsappMessage
        .replace('{identifier}', identifier)
        .replace('{password}', password);
      
      const whatsappLink = content.whatsappLink || 'https://wa.me/201112622236';
      window.open(`${whatsappLink}?text=${encodeURIComponent(message)}`, '_blank');

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = content.contact.successToast || 'Opening WhatsApp...';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    });
  }

  // Sign Up form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('fullname').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirm-password').value;
      const terms = document.getElementById('terms').checked;

      const content = I18nModule.getContent();
      const errors = content.auth.errors;

      if (name.length < 2) {
        alert(errors.nameMin || 'Name must be at least 2 characters');
        return;
      }
      const phoneDigits = phone.replace(/\s+/g, '');
      if (!/^01[0-9]{9}$/.test(phoneDigits)) {
        alert(errors.phoneInvalid || 'Please enter a valid Egyptian mobile number');
        return;
      }
      if (password.length < 8) {
        alert(errors.passwordMin || 'Password must be at least 8 characters');
        return;
      }
      if (password !== confirm) {
        alert(errors.passwordMatch || 'Passwords do not match');
        return;
      }
      if (!terms) {
        alert(errors.termsRequired || 'You must agree to the Terms and Conditions');
        return;
      }

      const message = content.auth.signup.whatsappMessage
        .replace('{name}', name)
        .replace('{phone}', phoneDigits)
        .replace('{password}', password);
      
      const whatsappLink = content.whatsappLink || 'https://wa.me/201112622236';
      window.open(`${whatsappLink}?text=${encodeURIComponent(message)}`, '_blank');

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = content.contact.successToast || 'Opening WhatsApp...';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    });
  }
})();