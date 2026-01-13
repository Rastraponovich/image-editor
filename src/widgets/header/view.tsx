import { Image as ImageIcon } from 'lucide-react';

import { DownloadImageButton } from '~/features/download-image';
import { RedoButton, UndoButton } from '~/features/history-buttons';
import { ThemeToggle } from '~/features/theme-toggle';
import { UploadImageButton } from '~/features/upload-image';
import {
  ResetZoomButton,
  ZoomInButton,
  ZoomOutButton,
} from '~/features/viewport-control';

import { Dialog, OpenButton } from '../image-resize-dialog';

export function Header() {
  return (
    <header className="bg-surface border-border-subtle flex h-16 shrink-0 items-center justify-between border-b px-6">
      <div className="text-text-primary flex items-center gap-2 text-xl font-bold">
        <ImageIcon className="text-primary" />
        <h1>Piclet</h1>
      </div>

      <div className="flex items-center gap-4">
        <OpenButton />
        <div className="border-border-subtle mr-4 flex items-center gap-1 border-r pr-4">
          <ResetZoomButton />
          <ZoomInButton />
          <ZoomOutButton />
        </div>
        <div className="border-border-subtle mr-4 flex items-center gap-1 border-r pr-4">
          <UndoButton />
          <RedoButton />
        </div>

        <UploadImageButton />

        <DownloadImageButton />

        <ThemeToggle />
      </div>
      <Dialog />
    </header>
  );
}
