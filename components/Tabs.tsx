import { ReactNode, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { Tabs as NextraTabs } from "nextra-theme-docs";
export { Tab } from "nextra-theme-docs";

type Props = {
  items: string[];
  storageKey?: string;
  children?: ReactNode;
};

export function SyncedTabs({
  items,
  storageKey = "abc",
  children = null,
}: Props) {
  const [data, setData] = useLocalStorage(storageKey, undefined);
  const [selectedIndex, setSelectedIndex] = useState(undefined);

  useEffect(() => setSelectedIndex(items.indexOf(data)), [data, items]);

  return (
    <NextraTabs
      items={items}
      selectedIndex={selectedIndex}
      onChange={(index) => {
        setData(items[index]);
      }}
    >
      {children}
    </NextraTabs>
  );
}
