'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { TranslatorMain } from '@/components/text-translator';
import Config from '@/components/config';
import { useEffect } from 'react';
import { useConfigStore } from '@/stores/configStore';
import LocaleSelector from '@/components/locale-selector';

const queryClient = new QueryClient();

function Header() {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const { loadConfig } = useConfigStore();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

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
}

// function Nav() {
//   return (
//     <NavigationMenu viewport={false}>
//       <NavigationMenuList>
//         <NavigationMenuItem>
//           <NavigationMenuLink asChild>
//             <Button variant={'outline'}>텍스트 번역</Button>
//           </NavigationMenuLink>
//         </NavigationMenuItem>
//         <NavigationMenuItem>
//           <NavigationMenuLink asChild>
//             <Button variant={'outline'} disabled>
//               문서 번역(준비 중)
//             </Button>
//           </NavigationMenuLink>
//         </NavigationMenuItem>
//         <NavigationMenuItem>
//           <NavigationMenuLink asChild>
//             <Button variant={'outline'} disabled>
//               용어집(준비 중)
//             </Button>
//           </NavigationMenuLink>
//         </NavigationMenuItem>
//       </NavigationMenuList>
//     </NavigationMenu>
//   );
// }

export default function Page() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Header />
        <div className="p-4">
          {/* <Nav /> */}
          <TranslatorMain />
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
