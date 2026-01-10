import { useUnit } from 'effector-react';
import { MaximizeIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';

import { Button } from '~/shared/ui';

import { resetZoomClicked, zoomInClicked, zoomOutClicked } from './model';

export function ZoomInButton() {
  const handleClick = useUnit(zoomInClicked);

  return (
    <Button onClick={handleClick}>
      <ZoomInIcon size={16} />
    </Button>
  );
}

export function ZoomOutButton() {
  const handleClick = useUnit(zoomOutClicked);

  return (
    <Button onClick={handleClick}>
      <ZoomOutIcon size={16} />
    </Button>
  );
}

export function ResetZoomButton() {
  const handleClick = useUnit(resetZoomClicked);

  return (
    <Button onClick={handleClick} variant="ghost" size="sm">
      <MaximizeIcon size={16} className="mr-2" />
      100%
    </Button>
  );
}
