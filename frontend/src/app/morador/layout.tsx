import { BottomNav } from '@/components/BottomNav';

export default function MoradorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
