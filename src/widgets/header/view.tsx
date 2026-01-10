import { Image as ImageIcon } from 'lucide-react';

import { DownloadImageButton } from '~/features/download-image';
import { RedoButton, UndoButton } from '~/features/history-buttons';
import { UploadImageButton } from '~/features/upload-image';
import {
  ResetZoomButton,
  ZoomInButton,
  ZoomOutButton,
} from '~/features/viewport-control';

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
      <div className="flex items-center gap-2 text-xl font-bold text-zinc-100">
        <ImageIcon className="text-blue-500" />
        <h1>Piclet</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="mr-4 flex items-center gap-1 border-r border-zinc-800 pr-4">
          <ResetZoomButton />
          <ZoomInButton />
          <ZoomOutButton />
        </div>
        <div className="mr-4 flex items-center gap-1 border-r border-zinc-800 pr-4">
          <UndoButton />
          <RedoButton />
        </div>

        <UploadImageButton />

        <DownloadImageButton />
      </div>
    </header>
  );
}
