import { APP_VERSION, BUILD_DATE, GIT_HASH } from '../config';

export const getFullVersionString = () => {
  const date = new Date(BUILD_DATE).toLocaleDateString();
  return `v${APP_VERSION} (${GIT_HASH}) [${date}]`;
};

/**
 * Логирует информацию о версии в консоль
 */
export const logAppVersion = () => {
  console.groupCollapsed(
    `%c Piclet %c v${APP_VERSION} `,
    'background: #3b82f6; color: #fff; border-radius: 3px 0 0 3px; padding: 2px 5px; font-weight: bold;',
    'background: #1e293b; color: #fff; border-radius: 0 3px 3px 0; padding: 2px 5px;',
  );
  console.log(`Version: ${APP_VERSION}`);
  console.log(`Commit: ${GIT_HASH}`);
  console.log(`Build Date: ${new Date(BUILD_DATE).toLocaleString()}`);
  console.groupEnd();
};
