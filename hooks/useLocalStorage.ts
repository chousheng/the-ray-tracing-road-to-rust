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

  const value = useSyncExternalStore(
    subscribe,
    getSnapShot,
    () => initialValue
  );

  const saveValue = (value) => {
    localStorage.setItem(storageKey, value);
    // We need to manually dispatch a custom event
    window.dispatchEvent(new Event("storage"));
  };

  return [value, saveValue];
}
