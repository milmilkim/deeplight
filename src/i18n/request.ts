import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from './services';
import deepmerge from 'deepmerge';

export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  console.log('locale', locale);

  const userMessages = (await import(`./${locale}.json`)).default;
  const defaultMessages = (await import(`./en.json`)).default;
  const messages = deepmerge(defaultMessages, userMessages);

  return {
    locale,
    messages,
  };
});
