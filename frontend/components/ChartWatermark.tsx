const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function ChartWatermark() {
  return (
    <div className="flex justify-end mt-1">
      <img
        src={`${BASE_PATH}/policyengine-logo.png`}
        alt="PolicyEngine"
        width={80}
        style={{ opacity: 0.7 }}
      />
    </div>
  );
}
