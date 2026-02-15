interface StatsCardProps {
  label: string;
  value: string;
}

export function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="bg-gray-50 border-2 border-orange-300 rounded-lg p-4">
      <h3 className="text-sm text-gray-600 mb-1">{label}</h3>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
