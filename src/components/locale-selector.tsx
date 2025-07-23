import { Languages } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  //   DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { setUserLocale } from '@/i18n/services';

const LocaleSelector = () => {
  const locale = useLocale();
  const [lang, setLang] = useState(locale);

  const changeLang = (value: string) => {
    setLang(value);
    setUserLocale(value);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Languages />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-32">
          <DropdownMenuRadioGroup
            value={lang}
            onValueChange={changeLang}
          >
            <DropdownMenuRadioItem value="ko">한국어</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default LocaleSelector;
