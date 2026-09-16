/**
 * MENTE RESILIENTE - SCRIPT INTERATIVO
 * Áudio feedback sutil, filtros por categoria, modais de compartilhamento e inscrição
 */

document.addEventListener('DOMContentLoaded', () => {
  initAudioFeedback();
  initCategoryTabs();
  initShareAndQrModal();
  initNewsletterCapture();
  initScrollAnimations();
});

/* ==========================================================================
   1. WEB AUDIO (FEEDBACK SONORO DISCRETO)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initAudioFeedback() {
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');

  // Recuperar preferência salva
  const savedSound = localStorage.getItem('mente_resiliente_sound');
  if (savedSound !== null) {
    soundEnabled = savedSound === 'true';
    updateSoundIcon(soundIcon, soundEnabled);
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('mente_resiliente_sound', soundEnabled);
      updateSoundIcon(soundIcon, soundEnabled);
      if (soundEnabled) {
        playSynthBeep(880, 'sine', 0.08, 0.06);
        showToast('🔊 Efeitos sonoros ativados');
      } else {
        showToast('🔇 Efeitos sonoros desativados');
      }
    });
  }

  // Adicionar feedback em elementos interativos
  document.querySelectorAll('.cyber-card, .tab-btn, .icon-btn, .card-cta-btn, .newsletter-btn, .floating-whatsapp-btn, .social-dock-btn').forEach(elem => {
    elem.addEventListener('mouseenter', () => {
      if (soundEnabled) playSynthBeep(520, 'triangle', 0.03, 0.02);
    });

    elem.addEventListener('click', () => {
      if (soundEnabled) playSynthBeep(980, 'sine', 0.06, 0.06);
    });
  });
}

function updateSoundIcon(iconElem, isEnabled) {
  if (!iconElem) return;
  if (isEnabled) {
    iconElem.innerHTML = `
      <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
    `;
    iconElem.style.color = '#10b981';
  } else {
    iconElem.innerHTML = `
      <line x1="1" y1="1" x2="23" y2="23"></line>
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    `;
    iconElem.style.color = '#64748b';
  }
}

function playSynthBeep(freq = 600, type = 'sine', duration = 0.05, gainValue = 0.03) {
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (!audioCtx || audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(gainValue, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Web audio não suportado ou silenciado
  }
}

/* ==========================================================================
   2. FILTRAGEM POR CATEGORIAS (MENU TABS)
   ========================================================================== */
function initCategoryTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.cyber-card');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');

      // Atualizar classe ativa do botão
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filtrar cards com transição suave
      cards.forEach(card => {
        const cardCategories = card.getAttribute('data-categories') || '';
        if (category === 'all' || cardCategories.includes(category)) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          card.style.transform = 'scale(0.97) translateY(8px)';
          setTimeout(() => {
            card.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'scale(1) translateY(0)';
          }, 30);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   3. COMPARTILHAMENTO & MODAL QR CODE
   ========================================================================== */
function initShareAndQrModal() {
  const shareBtn = document.getElementById('share-btn');
  const qrBtn = document.getElementById('qr-btn');
  const shareModal = document.getElementById('share-modal');
  const qrModal = document.getElementById('qr-modal');
  const closeBtns = document.querySelectorAll('.modal-close-btn, .modal-backdrop');
  const copyBtns = document.querySelectorAll('.share-copy-btn');
  const shareInputs = document.querySelectorAll('.share-input');

  const pageUrl = window.location.href;

  // Preencher input com URL atual
  shareInputs.forEach(input => {
    input.value = pageUrl;
  });

  // Botão Compartilhar
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Mente Resiliente | Desenvolvimento & Liberdade Financeira',
            text: 'Acesse treinamentos, e-books, artigos e mentorias para transformar sua mentalidade e construir negócios online.',
            url: pageUrl
          });
          return;
        } catch (err) {
          // Fallback para abrir modal se cancelado ou recusado
        }
      }
      openModal(shareModal);
    });
  }

  // Botão QR Code
  if (qrBtn) {
    qrBtn.addEventListener('click', () => {
      generateQrVisual();
      openModal(qrModal);
    });
  }

  // Fechar modais
  closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e.target === btn || btn.classList.contains('modal-close-btn')) {
        closeAllModals();
      }
    });
  });

  // Copiar link
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input) {
        input.select();
        navigator.clipboard.writeText(input.value).then(() => {
          showToast('✓ Link copiado para a área de transferência!');
          if (soundEnabled) playSynthBeep(1050, 'sine', 0.08, 0.08);
        });
      }
    });
  });
}

function openModal(modalElem) {
  if (!modalElem) return;
  modalElem.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAllModals() {
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.classList.remove('open');
  });
  document.body.style.overflow = '';
}

// Gerar QR code vetorial
function generateQrVisual() {
  const qrBox = document.getElementById('qr-render-box');
  if (!qrBox) return;

  const url = encodeURIComponent(window.location.href);
  qrBox.innerHTML = `
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${url}&color=0d151d&bgcolor=ffffff&qzone=1" 
         alt="QR Code Mente Resiliente" 
         width="180" 
         height="180" 
         style="display:block; border-radius: 8px;" />
  `;
}

/* ==========================================================================
   4. CAPTURA DE NEWSLETTER / SUBSTACK
   ========================================================================== */
function initNewsletterCapture() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('.newsletter-input');
    const email = input.value.trim();

    if (!email || !email.includes('@')) {
      showToast('⚠️ Por favor, insira um e-mail válido.');
      return;
    }

    const submitBtn = form.querySelector('.newsletter-btn');
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML = `<span>Inscrevendo...</span>`;
    submitBtn.style.opacity = '0.7';

    setTimeout(() => {
      submitBtn.innerHTML = `<span>✓ Inscrito com Sucesso!</span>`;
      submitBtn.style.background = 'var(--color-emerald)';
      submitBtn.style.color = '#06111a';
      showToast('🎉 Bem-vindo à Mente Resiliente! Redirecionando...');

      setTimeout(() => {
        window.open('https://menteresiliente.substack.com/', '_blank');
        input.value = '';
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        submitBtn.style.opacity = '1';
      }, 1500);
    }, 800);
  });
}

/* ==========================================================================
   5. TOAST NOTIFICATIONS & OBSERVER
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('dynamic-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'dynamic-toast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = message;
  toast.classList.add('show');

  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.cyber-card, .profile-hero, .newsletter-box').forEach(el => {
    observer.observe(el);
  });
}
