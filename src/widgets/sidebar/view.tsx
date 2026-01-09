import { useUnit } from 'effector-react';

import { ResetButton } from '~/features/reset-filters-button';

import { $image } from '~/entities/image';

import {
  BlurFilter,
  BrightnessFilter,
  ContastFilter,
  GrayscaleFilter,
  HueFilter,
  ImageQualityFilter,
  SaturationFilter,
  SepiaFilter,
} from './ui/filters';

export function Sidebar() {
  return (
    <aside className="flex w-80 flex-col gap-6 overflow-y-auto border-r border-zinc-800 bg-zinc-950 p-6">
      <Header />
      <Filters />
    </aside>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-zinc-100">Коррекция</h2>
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
