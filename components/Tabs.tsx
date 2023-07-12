import { Tab as NextraTab, Tabs as NextraTabs } from "nextra-theme-docs";
import {
  Children,
  ReactElement,
  ReactNode,
  isValidElement,
  useRef,
} from "react";

import { useLocalStorage } from "../hooks/useLocalStorage";
import { useScrollCompensation } from "../hooks/useScrollCompensation";

const extractChildrenLabels = (children) => {
  return Children.toArray(children)
    .filter((child) => isValidElement(child) && child.props.label)
    .map((child: ReactElement) => child.props.label);
};

type Props = {
  labels?: string[];
  storageKey?: string;
  children?: ReactNode;
};

export function Tabs({ labels, storageKey = "tab", children = null }: Props) {
  // labels in this parent "Tabs" takes higher priority than labels in children "Tab"
  const lbs = labels ?? extractChildrenLabels(children);

  // Save tab in localStorage
  const [activeTabLabel, saveActiveTabLabel] = useLocalStorage(
    storageKey,
    lbs[0]
  );

  let activeTabIdx = lbs.indexOf(activeTabLabel);
  if (activeTabIdx === -1) {
    activeTabIdx = 0;
  }

  // Prevent content jumping by compensating the scroll value when switching tabs
  const pinElementToViewport = useScrollCompensation();
  const pinElementRef = useRef();

  return (
    <div ref={pinElementRef}>
      <NextraTabs
        items={lbs}
        selectedIndex={activeTabIdx}
        onChange={(index) => {
          pinElementToViewport(pinElementRef.current);
          saveActiveTabLabel(lbs[index]);
        }}
      >
        {children}
      </NextraTabs>
    </div>
  );
}

export { NextraTab as Tab };
