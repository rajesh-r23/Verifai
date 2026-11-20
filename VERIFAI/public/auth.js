(() => {
  const loginButton = document.getElementById('loginBtn');
  const signupButton = document.getElementById('signupBtn');
  if (!loginButton && !signupButton) return;

  let modal = document.getElementById('modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <button class="modal-close" id="modalClose" type="button" aria-label="Close">&times;</button>
        <h3 id="modalTitle"></h3>
        <div id="modalBody"></div>
      </div>`;
    document.body.appendChild(modal);
  }

  const titleElement = modal.querySelector('#modalTitle');
  const bodyElement = modal.querySelector('#modalBody');
  const closeButton = modal.querySelector('#modalClose');

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function openAuthForm(title, withName) {
    titleElement.textContent = title;
    bodyElement.innerHTML = `
      <form class="auth-form">
        ${withName ? '<input name="name" type="text" placeholder="Full name" autocomplete="name" required>' : ''}
        <input name="email" type="email" placeholder="Email address" autocomplete="email" required>
        <input name="password" type="password" placeholder="Password" autocomplete="${withName ? 'new-password' : 'current-password'}" minlength="6" required>
        <button class="btn btn-primary" type="submit">${title}</button>
      </form>
      <div class="auth-result" aria-live="polite"></div>`;

    bodyElement.querySelector('.auth-form').addEventListener('submit', event => {
      event.preventDefault();
      bodyElement.querySelector('.auth-result').textContent =
        'The form is ready, but account authentication is not connected yet.';
    });

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    bodyElement.querySelector('input')?.focus();
  }

  loginButton?.addEventListener('click', () => openAuthForm('Login', false));
  signupButton?.addEventListener('click', () => openAuthForm('Sign Up', true));
  closeButton?.addEventListener('click', closeModal);
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();
