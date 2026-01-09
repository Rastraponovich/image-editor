import { useStoreMap, useUnit } from 'effector-react';

import {
  $filtersRef,
  $imageQuality,
  $isGridVisible,
  FilterKey,
  INITIAL_FILTERS,
  filtersChanged,
  gridToggled,
  imageQualityChanged,
} from '~/entities/image';

import { Slider, Toggle } from '~/shared/ui';

interface FilterProps {
  filterKey?: FilterKey;
}

export function BrightnessFilter(props: FilterProps) {
  const { filterKey = FilterKey.brightness } = props;

  const onChange = useUnit(filtersChanged);

  const value = useStoreMap({
    keys: [filterKey],
    store: $filtersRef,
    fn: ({ ref }, [key]) => ref.get(key),
    defaultValue: INITIAL_FILTERS[filterKey],
  });

  return (
    <Slider
      min={0}
      unit="%"
      max={200}
      value={value}
      label="Яркость"
      onChange={value => {
        onChange({ id: FilterKey[filterKey], value });
      }}
    />
  );
}

export function BlurFilter(props: FilterProps) {
  const { filterKey = FilterKey.blur } = props;

  const onChange = useUnit(filtersChanged);

  const value = useStoreMap({
    keys: [filterKey],
    store: $filtersRef,
    fn: ({ ref }, [key]) => ref.get(key),
    defaultValue: INITIAL_FILTERS[filterKey],
  });

  return (
    <Slider
      min={0}
      max={20}
      unit="px"
      value={value}
      label="Размытие"
      onChange={value => {
        onChange({ id: FilterKey[filterKey], value });
      }}
    />
  );
}

export function ContastFilter(props: FilterProps) {
  const { filterKey = FilterKey.contrast } = props;

  const onChange = useUnit(filtersChanged);

  const value = useStoreMap({
    keys: [filterKey],
    store: $filtersRef,
    fn: ({ ref }, [key]) => ref.get(key),
    defaultValue: INITIAL_FILTERS[filterKey],
  });

  return (
    <Slider
      min={0}
      unit="%"
      max={200}
      value={value}
      label="Контраст"
      onChange={value => {
        onChange({ id: FilterKey[filterKey], value });
      }}
    />
  );
}

export function SaturationFilter(props: FilterProps) {
  const { filterKey = FilterKey.saturation } = props;
  const onChange = useUnit(filtersChanged);

  const value = useStoreMap({
    keys: [filterKey],
    store: $filtersRef,
    fn: ({ ref }, [key]) => ref.get(key),
    defaultValue: INITIAL_FILTERS[filterKey],
  });

  return (
    <Slider
      min={0}
      unit="%"
      max={200}
      value={value}
      label="Насыщенность"
      onChange={value => {
        onChange({ id: FilterKey[filterKey], value });
      }}
    />
  );
}

export function HueFilter(props: FilterProps) {
  const { filterKey = FilterKey.hue } = props;

  const onChange = useUnit(filtersChanged);

  const value = useStoreMap({
    keys: [filterKey],
    store: $filtersRef,
    fn: ({ ref }, [key]) => ref.get(key),
    defaultValue: INITIAL_FILTERS[filterKey],
  });

  return (
    <Slider
      min={0}
      unit="°"
      max={360}
      value={value}
      label="Оттенок"
      onChange={value => {
        onChange({ id: FilterKey[filterKey], value });
      }}
    />
  );
}

export function GrayscaleFilter(props: FilterProps) {
  const { filterKey = FilterKey.grayscale } = props;

  const onChange = useUnit(filtersChanged);

  const value = useStoreMap({
    keys: [filterKey],
    store: $filtersRef,
    fn: ({ ref }, [key]) => ref.get(key),
    defaultValue: INITIAL_FILTERS[filterKey],
  });

  return (
    <Slider
      min={0}
      unit="%"
      max={100}
      value={value}
      label="Grayscale"
      onChange={value => {
        onChange({ id: FilterKey[filterKey], value });
      }}
    />
  );
}

export function SepiaFilter(props: FilterProps) {
  const { filterKey = FilterKey.sepia } = props;

  const onChange = useUnit(filtersChanged);

  const value = useStoreMap({
    store: $filtersRef,
    keys: [filterKey],
    fn: ({ ref }, [key]) => ref.get(key),
    defaultValue: INITIAL_FILTERS[filterKey],
  });

  return (
    <Slider
      min={0}
      unit="%"
      max={100}
      value={value}
      label="Сепия"
      onChange={value => {
        onChange({ id: FilterKey[filterKey], value });
      }}
    />
  );
}

export function ImageQualityFilter() {
  const [value, onChange] = useUnit([$imageQuality, imageQualityChanged]);

  return (
    <div className="grid gap-y-1">
      <Slider
        min={0}
        step={1}
        unit="%"
        max={100}
        value={value}
        label="Качество*"
        onChange={onChange}
      />
      <p className="text-xs text-zinc-400">
        *Приблизительный вариант изображения
      </p>
    </div>
  );
}

export function GridToggle() {
  const [isGridVisible, onToggle] = useUnit([$isGridVisible, gridToggled]);

  return <Toggle label="Сетка" checked={isGridVisible} onChange={onToggle} />;
}
