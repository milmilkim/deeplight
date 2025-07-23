import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from './services';
import deepmerge from 'deepmerge';

export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  const messageFiles = ['text', 'lang']; // 파일명 배열

  let mergedMessages: Record<string, unknown> = {};

  for (const file of messageFiles) {
    const enMessages = (await import(`./en/${file}.json`)).default as Record<string, unknown>;
    let localeMessages: Record<string, unknown> = {};
    try {
      localeMessages = (await import(`./${locale}/${file}.json`)).default as Record<string, unknown>;
    } catch {
      // ignore
    }
    const messages = deepmerge(enMessages, localeMessages);
    mergedMessages = deepmerge(mergedMessages, messages);
  }

  return {
    locale,
    messages: mergedMessages,
  };
});
