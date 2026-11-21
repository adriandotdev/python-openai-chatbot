// The chat theme. `astryx experimental theme editor` wrote this file once and never changes it again.
// The checked settings live in chat.settings.json and the generated chat.settings.ts;
// change them with `astryx experimental theme editor set chat ...`. Add your own changes below: they win over the settings.
import {defineTheme} from '@astryxdesign/core/theme';
import {chatSettings} from './chat.settings';

export const chatTheme = defineTheme({
  extends: chatSettings,
  name: 'chat',
});
