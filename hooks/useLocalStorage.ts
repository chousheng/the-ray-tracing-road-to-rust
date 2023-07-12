import { useSyncExternalStore } from "react";

export function useLocalStorage(storageKey, initialValue) {
  const subscribe = (onStoreChange) => {
    window.addEventListener("storage", onStoreChange);
    return () => {
      window.removeEventListener("storage", onStoreChange);
    };
  };

  const getSnapShot = () => {
    const state = localStorage.getItem(storageKey);
    return state;
  };

  const state = useSyncExternalStore(
    subscribe,
    getSnapShot,
    () => initialValue
  );

  const setState = (newState) => {
    localStorage.setItem(storageKey, newState);
    // We need to manually dispatch a custom event
    window.dispatchEvent(new Event("storage"));
  };

  return [state, setState];
}
