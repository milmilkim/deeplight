import { useConfigStore } from '@/stores/configStore';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { BookUser, Check, ChevronsUpDown, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

export default function PromptSelector() {
    const [open, setOpen] = useState(false);
    const { config, updateTranslatorConfig } = useConfigStore();

    const presets = config.translatorConfig.prompts || [];
    const fragments = config.translatorConfig.promptFragments || [];

    const activePresetId = config.translatorConfig.activePromptId || 'default';
    const activeFragmentIds = config.translatorConfig.activePromptFragmentIds || [];

    const activePresetName = presets.find(p => p.id === activePresetId)?.name || 'Default';
    const activeFragmentsCount = activeFragmentIds.length;

    const handleSelectPreset = (id: string) => {
        updateTranslatorConfig({ activePromptId: id });
        // setOpen(false); // Keep open to allow selecting fragments
    };

    const handleToggleFragment = (id: string) => {
        const isActive = activeFragmentIds.includes(id);
        const newIds = isActive
            ? activeFragmentIds.filter(fid => fid !== id)
            : [...activeFragmentIds, id];
        updateTranslatorConfig({ activePromptFragmentIds: newIds });
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="h-9 justify-between text-xs px-2 md:px-3 w-[110px] lg:w-auto lg:min-w-[140px]"
                >
                    <div className="flex items-center gap-2 truncate">
                        <BookUser className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate max-w-[60px] lg:max-w-[100px]">{activePresetName}</span>
                    </div>
                    {activeFragmentsCount > 0 && (
                        <Badge variant="secondary" className="ml-2 h-5 px-1 text-[10px] bg-primary/10 text-primary hover:bg-primary/20">
                            +{activeFragmentsCount}
                        </Badge>
                    )}
                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
                <div className="flex flex-col max-h-[400px]">
                    <div className="p-2 bg-muted/30 border-b">
                        <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1">Persona (Select One)</h4>
                    </div>
                    <ScrollArea className="flex-col overflow-y-auto max-h-[160px]">
                        <div className="p-1">
                            {presets.map((preset) => (
                                <div
                                    key={preset.id}
                                    className={cn(
                                        "relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                        activePresetId === preset.id && "bg-accent/50 text-accent-foreground"
                                    )}
                                    onClick={() => handleSelectPreset(preset.id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            activePresetId === preset.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="truncate font-medium">{preset.name}</span>
                                    </div>
                                </div>
                            ))}
                            {presets.length === 0 && <div className="p-2 text-xs text-center text-muted-foreground">No presets available</div>}
                        </div>
                    </ScrollArea>

                    <Separator />

                    <div className="p-2 bg-muted/30 border-b border-t">
                        <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1">Fragments (Toggle Multiple)</h4>
                    </div>
                    <ScrollArea className="flex-col overflow-y-auto max-h-[160px]">
                        <div className="p-1">
                            {fragments.map((fragment) => (
                                <div
                                    key={fragment.id}
                                    className="relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => handleToggleFragment(fragment.id)}
                                >
                                    <div className={cn(
                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                        activeFragmentIds.includes(fragment.id) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                    )}>
                                        <Check className={cn("h-3 w-3")} />
                                    </div>
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="truncate">{fragment.name}</span>
                                        {fragment.description && <span className="text-[10px] text-muted-foreground truncate">{fragment.description}</span>}
                                    </div>
                                </div>
                            ))}
                            {fragments.length === 0 && <div className="p-2 text-xs text-center text-muted-foreground">No fragments available</div>}
                        </div>
                    </ScrollArea>
                </div>
            </PopoverContent>
        </Popover>
    );
}
