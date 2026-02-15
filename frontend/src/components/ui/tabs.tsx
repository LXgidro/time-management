interface TabItem<T = string> {
  id: T;
  label: string;
}

interface TabsProps<T> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
}

export function Tabs<T = string>({
  tabs,
  activeTab,
  onTabChange,
}: TabsProps<T>) {
  return (
    <div className="border-b border-orange-300">
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id as string}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 border-b-2 transition-colors font-medium ${
              activeTab === tab.id
                ? 'border-orange-400 text-orange-500'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
