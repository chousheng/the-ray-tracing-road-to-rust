import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "usehooks-ts";

export function useScrollCompensation() {
  const compensateScrollCallback = useRef(undefined);

  const pinnedElement = useRef<HTMLElement>();

  const pinElementToTheViewport = (element: HTMLElement) => {
    // Get the element position before DOM changed
    const top = element.getBoundingClientRect().top;
    pinnedElement.current = element;

    // Callback to be called to compensate the scroll value
    compensateScrollCallback.current = () => {
      // Get the element position after DOM changed (useLayoutEffect)
      const newTop = pinnedElement.current.getBoundingClientRect().top;
      pinnedElement.current = undefined;
      compensateScrollCallback.current = undefined;

      const diff = newTop - top;
      if (diff) {
        window.scrollBy({ left: 0, top: diff }); // Compensate
      }
    };
  };

  useIsomorphicLayoutEffect(() => {
    if (compensateScrollCallback.current) {
      // Using queueMicrotask ensures that we run the callback after all useIsomorphicLayoutEffect
      // hooks are called, and thus we can compensate the scroll value correctly
      queueMicrotask(() => compensateScrollCallback.current());
    }
  });

  return pinElementToTheViewport;
}
