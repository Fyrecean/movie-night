import React, { useState, ReactNode } from 'react';

interface TabProps {
  title: string;
  children: ReactNode;
}

const Tab: React.FC<TabProps> = ({ children }) => <>{children}</>;

interface TabsProps {
  children: React.ReactElement<TabProps>[];
}

const Tabs: React.FC<TabsProps> = ({ children }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div>
      <div>
        {React.Children.map(children, (child, index) => (
          <button onClick={() => setSelectedTab(index)}>
            {child.props.title}
          </button>
        ))}
      </div>
      <div>
        {React.Children.toArray(children)[selectedTab]}
      </div>
    </div>
  );
};

export { Tabs, Tab };