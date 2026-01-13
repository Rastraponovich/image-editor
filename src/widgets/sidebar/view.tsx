import { useUnit } from 'effector-react';
import { ChevronsRight } from 'lucide-react';

import { ResetButton } from '~/features/reset-filters-button';

import { $image } from '~/entities/image';

import { APP_VERSION, GIT_HASH } from '~/shared/config';
import { cn } from '~/shared/lib/cn';

import { $isSidebarOpen, sidebarToggled } from './model';
import {
  BlurFilter,
  BrightnessFilter,
  ContastFilter,
  GrayscaleFilter,
  GridToggle,
  HueFilter,
  ImageQualityFilter,
  SaturationFilter,
  SepiaFilter,
} from './ui/filters';

function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, onToggle] = useUnit([$isSidebarOpen, sidebarToggled]);
  return (
    <div className="relative grid">
      <aside
        className={cn(
          'border-border-subtle bg-surface flex border-r transition-[width] duration-200',
          isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden',
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-6 overflow-y-auto p-6',
            !isSidebarOpen && 'pointer-events-none opacity-0',
          )}
        >
          {children}
        </div>
      </aside>

      <button
        onClick={onToggle}
        className="bg-surface absolute top-1/3 right-px z-10 translate-x-full -translate-y-1/2 rounded-r-lg px-0.5 py-20"
      >
        <ChevronsRight
          size={20}
          strokeWidth={1.5}
          className={cn(
            'text-text-secondary shrink-0 transition-transform duration-150',
            isSidebarOpen && 'rotate-180',
          )}
        />
      </button>
    </div>
  );
}

export function Sidebar() {
  return (
    <SidebarWrapper>
      <Header />
      <Filters />
      <div className="text-text-secondary mt-auto pt-6 text-center text-xs">
        Piclet v{APP_VERSION} ({GIT_HASH})
      </div>
    </SidebarWrapper>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <h2 className="text-text-primary text-lg font-semibold">Коррекция</h2>
      <ResetButton />
    </header>
  );
}

function Filters() {
  return (
    <Fieldset>
      <BrightnessFilter />
      <BlurFilter />
      <ContastFilter />
      <SaturationFilter />
      <HueFilter />
      <GrayscaleFilter />
      <SepiaFilter />
      <hr className="border-border-subtle" />
      <GridToggle />
      <ImageQualityFilter />
    </Fieldset>
  );
}

function Fieldset({ children }: { children: React.ReactNode }) {
  const image = useUnit($image);

  return (
    <fieldset disabled={!image} className="space-y-4">
      {children}
    </fieldset>
  );
}
