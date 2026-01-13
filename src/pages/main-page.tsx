import { Header } from '~/widgets/header';
import { Sidebar } from '~/widgets/sidebar';
import { CanvasStage } from '~/widgets/stage';

export function MainPage() {
  return (
    <div className="bg-app text-text-primary flex h-screen w-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="relative min-w-0 flex-1">
          <CanvasStage />
        </main>
      </div>
    </div>
  );
}
