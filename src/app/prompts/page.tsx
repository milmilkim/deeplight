'use client';

import { useConfigStore } from '@/stores/configStore';
import Prompts from '@/components/global-config-modal/prompts';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ThemeProvider } from '@/components/theme-provider';

export default function PromptsPage() {
    const { config, updateTranslatorConfig } = useConfigStore();

    return (
        <ThemeProvider>
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                <header className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <Link href="/" passHref>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-lg font-semibold">Manage Prompts</h1>
                    </div>
                </header>

                {/* Mobile: scrollable, Desktop: fixed height */}
                <main className="flex-1 p-4 md:p-6 md:h-[calc(100vh-65px)] md:overflow-hidden">
                    <div className="max-w-5xl mx-auto h-full flex flex-col">
                        <div className="flex-1 border rounded-md shadow-sm bg-card p-4 h-full md:overflow-hidden">
                            <Prompts
                                config={config.translatorConfig}
                                updateConfig={updateTranslatorConfig}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </ThemeProvider>
    );
}
