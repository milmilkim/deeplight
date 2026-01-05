'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { TranslatorMain as DeepLTranslatorMain } from '@/components/text-translator/deepl-mode';
import { TranslatorMain as AITranslatorMain } from '@/components/text-translator/ai-mode'

import Config from '@/components/global-config-modal/modal';
import LocaleSelector from '@/components/locale-selector';
import { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

const queryClient = new QueryClient();

const Header = () => {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-background">
      <div className="text-lg font-semibold tracking-tight">DeepLight</div>
      <div className="flex items-center gap-2">
        <LocaleSelector />
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Config />
      </div>
    </header>
  );
};

type AppMode = 'LLM' | 'DEEPL';
interface AppModeContextType {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

const NavTab = ({
  isActive,
  onClick,
  children
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'text-sm transition-all',
      isActive
        ? 'font-semibold text-foreground underline underline-offset-4 decoration-2'
        : 'font-normal text-muted-foreground hover:text-foreground'
    )}
  >
    {children}
  </button>
);

const Nav = () => {
  const context = useContext(AppModeContext);

  return (
    <div className="flex items-center justify-start gap-3 mb-8">
      <NavTab
        isActive={context?.appMode === 'LLM'}
        onClick={() => context?.setAppMode('LLM')}
      >
        AI
      </NavTab>

      <span className="text-muted-foreground/30">|</span>

      <NavTab
        isActive={context?.appMode === 'DEEPL'}
        onClick={() => context?.setAppMode('DEEPL')}
      >
        DeepL <span className="text-[10px] text-muted-foreground/50">(legacy)</span>
      </NavTab>
    </div>
  );
};

const Page = () => {
  const [appMode, setAppMode] = useState<'LLM' | 'DEEPL'>('LLM');

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Header />
        <div className="p-4">
          <AppModeContext.Provider
            value={{
              appMode,
              setAppMode,
            }}
          >
            <Nav />
            {appMode === 'LLM' ? <AITranslatorMain /> : <DeepLTranslatorMain />}
          </AppModeContext.Provider>
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default Page;