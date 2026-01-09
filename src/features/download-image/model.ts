import { attach, createEvent, sample } from 'effector';

import { $canvas, $imageQuality, $imageRaw } from '~/entities/image';

export const donwloadButtonClicked = createEvent();

export const downloadImageFx = attach({
  source: { image: $imageRaw, quality: $imageQuality, editor: $canvas },
  effect: async ({ image, quality, editor }) => {
    if (!image) {
      throw new Error('no image to download');
    }

    const dataUrl = editor.toDataURL(
      image.type, // Используем исходный тип (image/png, image/jpeg и т.д.)
      quality / 100,
    );

    if (dataUrl) {
      const link = document.createElement('a');
      link.download = image.name || 'edited-image';
      link.href = dataUrl;
      link.click();
      link.remove();
      return true;
    }

    throw new Error('cannot generate image data');
  },
});

export const $pending = downloadImageFx.pending;

sample({
  clock: donwloadButtonClicked,
  target: downloadImageFx,
});
