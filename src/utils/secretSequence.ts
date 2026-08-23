/**
 * Secret Tap Sequence Manager for Mobile and Desktop Access.
 * Pattern: ABAABBBA
 * A = DataPulse (Brand logo/title)
 * B = Name (Rohit Banerjee / User Name)
 */

const TARGET_SEQUENCE = 'ABAABBBA';
const RESET_TIMEOUT_MS = 4500; // 4.5 seconds idle reset

type TapType = 'A' | 'B';

let currentSequence = '';
let resetTimeout: ReturnType<typeof setTimeout> | null = null;
const subscribers = new Set<(progress: { current: string; length: number; target: string }) => void>();

export function registerSecretTap(type: TapType, navigateCallback?: () => void) {
  if (resetTimeout) {
    clearTimeout(resetTimeout);
  }

  const nextCandidate = currentSequence + type;

  if (TARGET_SEQUENCE.startsWith(nextCandidate)) {
    currentSequence = nextCandidate;
  } else {
    // If it didn't match the continuation, check if this tap could start a fresh sequence
    currentSequence = type === 'A' ? 'A' : '';
  }

  // Notify any subscribers (e.g. for developer debug or haptic triggers)
  const info = {
    current: currentSequence,
    length: currentSequence.length,
    target: TARGET_SEQUENCE,
  };
  subscribers.forEach((fn) => fn(info));

  if (currentSequence === TARGET_SEQUENCE) {
    currentSequence = '';
    
    // Haptic feedback for mobile devices
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate([60, 40, 100]);
      } catch (_) {
        // Ignore devices without haptics
      }
    }

    if (navigateCallback) {
      navigateCallback();
    }
  } else {
    resetTimeout = setTimeout(() => {
      currentSequence = '';
      subscribers.forEach((fn) => fn({ current: '', length: 0, target: TARGET_SEQUENCE }));
    }, RESET_TIMEOUT_MS);
  }
}

export function subscribeToSecretSequence(
  callback: (progress: { current: string; length: number; target: string }) => void
) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}
