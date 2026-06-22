import { BackgroundMusic } from "@/components/knapsack/BackgroundMusic";

export default function KnapsackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BackgroundMusic />
    </>
  );
}
