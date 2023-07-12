import { ReactNode, useRef } from "react";

import { useLocalStorage } from "../hooks/useLocalStorage";
import { useScrollCompensation } from "../hooks/useScrollCompensation";

import { Tabs as NextraTabs } from "nextra-theme-docs";
export { Tab } from "nextra-theme-docs";

type Props = {
  items: string[];
  storageKey?: string;
  children?: ReactNode;
};

export function SyncedTabs({
  items,
  storageKey = "tab",
  children = null,
}: Props) {
  const [activeTab, setActiveTab] = useLocalStorage(storageKey, items[0]);

  let activeTabIdx = items.indexOf(activeTab);
  if (activeTabIdx === -1) {
    activeTabIdx = 0;
  }

  const pinElementToTheViewport = useScrollCompensation();

  const pinElementRef = useRef();

  return (
    <div ref={pinElementRef}>
      <NextraTabs
        items={items}
        selectedIndex={activeTabIdx}
        onChange={(index) => {
          pinElementToTheViewport(pinElementRef.current);
          setActiveTab(items[index]);
        }}
      >
        {children}
      </NextraTabs>
    </div>
  );
}
