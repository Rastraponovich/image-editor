import { Header } from '~/widgets/header';
import { Sidebar } from '~/widgets/sidebar';
import { CanvasStage } from '~/widgets/stage';

export function MainPage() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-900 text-zinc-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="relative flex-1">
          <CanvasStage />
        </main>
      </div>
    </div>
  );
}
