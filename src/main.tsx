import { createRoot } from 'react-dom/client';

import { allSettled, fork } from 'effector';
import { Provider } from 'effector-react';

import { Application } from '~/app';

import { logAppVersion } from '~/shared/lib/version';

import './index.css';
import { applicationStarted } from './shared/init';

const scope = fork();

logAppVersion();

await allSettled(applicationStarted, { scope }).catch(error => {
  console.error(error, 'error in application please contact support');
});

const root = document.getElementById('root')!;

createRoot(root).render(
  <Provider value={scope}>
    <Application />
  </Provider>,
);
