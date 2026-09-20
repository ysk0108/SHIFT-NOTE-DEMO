(() => {
  const state = {
    supported: 'serviceWorker' in navigator,
    registration: null,
    deferredPrompt: null,
    installed: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true,
    online: navigator.onLine,
    platform: /android/i.test(navigator.userAgent) ? 'android' : (/iphone|ipad|ipod/i.test(navigator.userAgent) ? 'ios' : 'other'),
    notificationPermission: ('Notification' in window ? Notification.permission : 'unsupported'),
    updateReady: false
  };

  const listeners = new Set();
  const emit = () => listeners.forEach(fn => {
    try { fn({ ...state }); } catch {}
  });

  const b64ToUint8 = value => {
    const padding = '='.repeat((4 - value.length % 4) % 4);
    const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  };

  async function register() {
    if (!state.supported) {
      emit();
      return null;
    }

    try {
      const reg = await navigator.serviceWorker.register('./service-worker.js', { scope: './' });
      state.registration = reg;

      if (reg.waiting) state.updateReady = true;

      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            state.updateReady = true;
            emit();
          }
        });
      });

      emit();
      return reg;
    } catch (err) {
      console.warn('SHIFT NOTE service worker registration failed', err);
      emit();
      return null;
    }
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    state.deferredPrompt = event;
    emit();
  });

  window.addEventListener('appinstalled', () => {
    state.installed = true;
    state.deferredPrompt = null;
    emit();
  });

  window.addEventListener('online', () => {
    state.online = true;
    emit();
  });

  window.addEventListener('offline', () => {
    state.online = false;
    emit();
  });

  async function install() {
    if (state.installed) return { ok: true, reason: 'installed' };

    if (state.deferredPrompt) {
      const prompt = state.deferredPrompt;
      state.deferredPrompt = null;
      await prompt.prompt();
      const choice = await prompt.userChoice;
      emit();
      return { ok: choice.outcome === 'accepted', reason: choice.outcome };
    }

    if (state.platform === 'ios') return { ok: false, reason: 'ios-manual' };
    return { ok: false, reason: 'not-available' };
  }

  async function enableNotifications() {
    if (!('Notification' in window)) return { ok: false, reason: 'unsupported' };
    if (!state.registration) await register();

    const permission = await Notification.requestPermission();
    state.notificationPermission = permission;
    emit();

    if (permission !== 'granted') return { ok: false, reason: permission };

    if (state.registration) {
      await state.registration.showNotification('SHIFT NOTE', {
        body: '通知を有効にしました。引き継ぎ・緊急報告・シフト確定などを受け取れる準備ができました。',
        icon: './pwa-icon.svg',
        badge: './pwa-icon.svg',
        data: { url: './?open=notifications' }
      });
    }
    return { ok: true, reason: 'granted' };
  }

  async function subscribePush({ publicKey, endpoint, payload = {} } = {}) {
    if (!publicKey || !endpoint) return { ok: false, reason: 'backend-not-configured' };
    if (!state.registration) await register();
    if (!state.registration || !('PushManager' in window)) return { ok: false, reason: 'unsupported' };

    const permission = await Notification.requestPermission();
    state.notificationPermission = permission;
    if (permission !== 'granted') return { ok: false, reason: permission };

    const subscription = await state.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: b64ToUint8(publicKey)
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ subscription, ...payload })
    });

    if (!response.ok) throw new Error('Push subscription registration failed');
    return { ok: true, subscription };
  }

  function applyUpdate() {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(() => location.reload(), 250);
    } else {
      location.reload();
    }
  }

  window.ShiftNotePWA = {
    state,
    onState(fn) { listeners.add(fn); fn({ ...state }); return () => listeners.delete(fn); },
    register,
    install,
    enableNotifications,
    subscribePush,
    applyUpdate,
    isStandalone() { return state.installed; }
  };

  register();
})();