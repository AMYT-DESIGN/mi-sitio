document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Menú responsive ---------- */
  const menu = document.getElementById('menu');

  const closeMenu = () => {
    if (menu) menu.classList.remove('open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  };
  const openMenu = () => {
    if (menu) menu.classList.add('open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
  };

  // ====== Inserta: cálculo dinámico del top del menú y bloqueo de scroll ======
  const headerEl = document.querySelector('header');
  const menuEl = document.getElementById('menu');
  const bodyEl = document.body;

  const setHeaderHeightVar = () => {
    if (!headerEl) return;
    const h = headerEl.offsetHeight;
    document.documentElement.style.setProperty('--header-height', `${h}px`);
    // si el menú está abierto, reajusta su max-height por si cambio de tamaño
    if (menuEl && menuEl.classList.contains('open')) {
      menuEl.style.maxHeight = `calc(100vh - ${h}px)`;
    }
  };

  // ejecutar ahora y al redimensionar
  setHeaderHeightVar();
  window.addEventListener('resize', setHeaderHeightVar);

  // envolver toggle existente para añadir body.menu-open
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle && menuEl) {
    // Si tu código ya añade listener, reemplaza la lógica de toggle por esta (evita duplicados)
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const opening = !menuEl.classList.contains('open');
      menuEl.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', menuEl.classList.contains('open') ? 'true' : 'false');
      // bloquear scroll del body cuando el menú está abierto
      if (opening) {
        bodyEl.classList.add('menu-open');
      } else {
        bodyEl.classList.remove('menu-open');
      }
    });

    // cerrar al clicar fuera (ya tenías código similar; asegúrate de no duplicarlo)
    document.addEventListener('click', (e) => {
      if (!e.target.closest('header') && menuEl.classList.contains('open')) {
        menuEl.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        bodyEl.classList.remove('menu-open');
      }
    }, { passive: true });
  }
  // ====== fin inserción ======

  /* ---------- Header hide on scroll (opcional) ---------- */
  const header = document.querySelector('header');
  if (header) {
    let lastScroll = window.pageYOffset || document.documentElement.scrollTop;
    let ticking = false;
    const threshold = 10;
    const showAtTop = 50;

    window.addEventListener('scroll', () => {
      const current = window.pageYOffset || document.documentElement.scrollTop;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const delta = current - lastScroll;
          if (Math.abs(delta) > threshold) {
            if (delta > 0 && current > showAtTop) {
              header.classList.add('header-hidden');
            } else {
              header.classList.remove('header-hidden');
            }
            lastScroll = current;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- Formulario de contacto (seguro) ---------- */
  const form = document.getElementById('contact-form');
  const btn = document.getElementById('send-btn');
  const status = document.getElementById('status');

  if (form && btn && status) {
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const privacidadCheckbox = form.querySelector('#privacidad');

    const validate = () => {
      const nombre = (form.nombre && form.nombre.value || '').trim();
      const email = (form.email && form.email.value || '').trim();
      const mensaje = (form.mensaje && form.mensaje.value || '').trim();

      if (!nombre || !email || !mensaje) {
        status.textContent = "Por favor completa todos los campos.";
        return false;
      }
      if (!reEmail.test(email)) {
        status.textContent = "Introduce un correo válido.";
        return false;
      }
      // Comprobar aceptación de la política de privacidad
      if (!privacidadCheckbox || !privacidadCheckbox.checked) {
        status.textContent = "Debes aceptar la política de privacidad para continuar.";
        return false;
      }
      return true;
    };

    const sendForm = async () => {
      if (!validate()) return;
      btn.disabled = true;
      const prevText = btn.textContent;
      btn.textContent = "Enviando...";
      status.textContent = "";
      try {
        const data = new FormData(form);
        const res = await fetch(form.action, { method: form.method || 'POST', body: data, headers: { 'Accept': 'application/json' }});
        if (res.ok) {
          status.textContent = "✅ ¡Gracias! Tu mensaje se ha enviado correctamente.";
          form.reset();
        } else {
          let msg = "❌ Error al enviar. Intenta de nuevo.";
          try { const json = await res.json(); if (json && json.error) msg = `❌ ${json.error}`; } catch (e) {}
          status.textContent = msg;
        }
      } catch (err) {
        console.error(err);
        status.textContent = "⚠️ No se pudo conectar con el servicio de envío.";
      } finally {
        btn.disabled = false;
        btn.textContent = prevText || "Enviar";
      }
    };

    btn.addEventListener('click', sendForm);
    form.addEventListener('submit', (e) => { e.preventDefault(); sendForm(); });
  }
});