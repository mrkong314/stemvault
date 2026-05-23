// Frontend-only edit-mode toggle.
// Unlocked state stored in localStorage; reflected on <body data-edit="on">.
// Pin is sourced from PUBLIC_EDIT_PIN (so it ships to the client - this is by design).

const STORAGE_KEY = 'svault_edit';
const EXPECTED_PIN = (import.meta.env.PUBLIC_EDIT_PIN ?? '').trim();

function applyState(unlocked: boolean) {
  document.body.dataset.edit = unlocked ? 'on' : 'off';
  document.body.dispatchEvent(
    new CustomEvent('svault:edit-mode', { detail: { unlocked } }),
  );
}

function isUnlocked(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1';
}

export function unlockWithPin(pin: string): boolean {
  if (!EXPECTED_PIN) return false;
  if (pin.trim() === EXPECTED_PIN) {
    localStorage.setItem(STORAGE_KEY, '1');
    applyState(true);
    return true;
  }
  return false;
}

export function lock() {
  localStorage.removeItem(STORAGE_KEY);
  applyState(false);
}

// Boot
applyState(isUnlocked());

// Expose for the EditToggle component
(window as any).StemVaultEdit = { unlockWithPin, lock, isUnlocked };
