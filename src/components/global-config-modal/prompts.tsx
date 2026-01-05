import React, { useState, useEffect } from 'react';
import { TranslatorConfig, PromptPreset, PromptFragment } from '@/types/global-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { nanoid } from 'nanoid';

interface PromptsProps {
    config: Partial<TranslatorConfig>;
    updateConfig: (updates: Partial<TranslatorConfig>) => void;
}

const Prompts = ({ config, updateConfig }: PromptsProps) => {
    // --- Main Prompts State ---
    const [presets, setPresets] = useState<PromptPreset[]>(config.prompts || []);
    const [activePresetId, setActivePresetId] = useState<string>(config.activePromptId || 'default');
    const [selectedPresetId, setSelectedPresetId] = useState<string>('');

    // --- Fragments State ---
    const [fragments, setFragments] = useState<PromptFragment[]>(config.promptFragments || []);
    const [activeFragmentIds, setActiveFragmentIds] = useState<string[]>(config.activePromptFragmentIds || []);
    const [selectedFragmentId, setSelectedFragmentId] = useState<string | null>(null);

    // --- Editor State ---
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editContent, setEditContent] = useState('');

    // Sync with global config
    useEffect(() => {
        if (config.prompts) {
            setPresets(config.prompts);
            if (!selectedPresetId && config.prompts.length > 0) {
                // Prefer active preset, otherwise first
                const targetId = config.activePromptId && config.prompts.find(p => p.id === config.activePromptId)
                    ? config.activePromptId
                    : config.prompts[0].id;
                setSelectedPresetId(targetId);
            }
        }
        if (config.activePromptId) setActivePresetId(config.activePromptId);

        if (config.promptFragments) {
            setFragments(config.promptFragments);
            if (!selectedFragmentId && config.promptFragments.length > 0) {
                setSelectedFragmentId(config.promptFragments[0].id);
            }
        }
        if (config.activePromptFragmentIds) setActiveFragmentIds(config.activePromptFragmentIds);
    }, [config]);


    // Mode: 'preset' or 'fragment'
    const [mode, setMode] = useState<'preset' | 'fragment'>('preset');

    // Load selected item into editor
    useEffect(() => {
        if (mode === 'preset') {
            const target = presets.find(p => p.id === selectedPresetId);
            if (target) {
                setEditName(target.name);
                setEditDesc(target.description || '');
                setEditContent(target.content);
            }
        } else {
            const target = fragments.find(p => p.id === selectedFragmentId);
            if (target) {
                setEditName(target.name);
                setEditDesc(target.description || '');
                setEditContent(target.content);
            } else {
                setEditName(''); setEditDesc(''); setEditContent('');
            }
        }
    }, [mode, selectedPresetId, selectedFragmentId, presets, fragments]);

    // --- Handlers for Presets ---
    const handleCreatePreset = () => {
        const newId = nanoid(8);
        const newItem: PromptPreset = {
            id: newId,
            name: 'New Prompt',
            description: 'Custom translation prompt',
            content: 'You are a professional translator...'
        };
        const newPresets = [...presets, newItem];
        setPresets(newPresets);
        setSelectedPresetId(newId);
        setMode('preset');
        updateConfig({ prompts: newPresets });
    };

    const handleDeletePreset = (id: string) => {
        const newPresets = presets.filter(p => p.id !== id);
        setPresets(newPresets);

        // Determine new selection
        let nextId = selectedPresetId;
        if (selectedPresetId === id) {
            nextId = newPresets.length > 0 ? newPresets[0].id : '';
            setSelectedPresetId(nextId);
        }

        // Determine new active
        if (activePresetId === id) {
            const newActive = newPresets.length > 0 ? newPresets[0].id : '';
            setActivePresetId(newActive);
            updateConfig({ prompts: newPresets, activePromptId: newActive });
        } else {
            updateConfig({ prompts: newPresets });
        }
    };

    const handleSavePreset = () => {
        const newPresets = presets.map(p =>
            p.id === selectedPresetId
                ? { ...p, name: editName, description: editDesc, content: editContent }
                : p
        );
        setPresets(newPresets);
        updateConfig({ prompts: newPresets });
        // Feedback logic could be added here
    };

    const handleActivatePreset = (id: string) => {
        setActivePresetId(id);
        updateConfig({ activePromptId: id });
    };


    // --- Handlers for Fragments ---
    const handleCreateFragment = () => {
        const newId = nanoid(8);
        const newItem: PromptFragment = {
            id: newId,
            name: 'New Glossary/Rule',
            description: 'Specific term or rule',
            content: 'Translate "..." as "..."'
        };
        const newFragments = [...fragments, newItem];
        setFragments(newFragments);
        setSelectedFragmentId(newId);
        setMode('fragment');
        updateConfig({ promptFragments: newFragments });
    };

    const handleDeleteFragment = (id: string) => {
        const newFragments = fragments.filter(p => p.id !== id);
        setFragments(newFragments);

        if (activeFragmentIds.includes(id)) {
            const newActiveIds = activeFragmentIds.filter(fid => fid !== id);
            setActiveFragmentIds(newActiveIds);
            updateConfig({ promptFragments: newFragments, activePromptFragmentIds: newActiveIds });
        } else {
            updateConfig({ promptFragments: newFragments });
        }

        if (selectedFragmentId === id) {
            setSelectedFragmentId(newFragments.length > 0 ? newFragments[0].id : null);
        }
    };

    const handleSaveFragment = () => {
        if (!selectedFragmentId) return;
        const newFragments = fragments.map(p =>
            p.id === selectedFragmentId
                ? { ...p, name: editName, description: editDesc, content: editContent }
                : p
        );
        setFragments(newFragments);
        updateConfig({ promptFragments: newFragments });
    };

    const handleToggleFragment = (id: string) => {
        const isActive = activeFragmentIds.includes(id);
        const newActiveIds = isActive
            ? activeFragmentIds.filter(fid => fid !== id)
            : [...activeFragmentIds, id];

        setActiveFragmentIds(newActiveIds);
        updateConfig({ activePromptFragmentIds: newActiveIds });
    };


    return (
        <div className="flex flex-col h-full w-full gap-4 min-h-0 bg-background">
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'preset' | 'fragment')} className="w-full flex-1 flex flex-col min-h-0">
                <TabsList className="w-full justify-start flex-shrink-0">
                    <TabsTrigger value="preset">System Prompts</TabsTrigger>
                    <TabsTrigger value="fragment">Glossary & Rules</TabsTrigger>
                </TabsList>

                <div className="flex flex-col md:flex-row flex-1 gap-6 md:gap-4 mt-4 md:min-h-0 min-h-0">
                    {/* --- LIST SIDEBAR --- */}
                    <div className="w-full md:w-1/3 md:border-r md:pr-4 flex flex-col flex-shrink-0 md:h-full md:min-h-0">
                        <div className="flex items-center justify-between mb-2 md:mb-4 flex-shrink-0">
                            <h3 className="font-semibold text-sm">
                                {mode === 'preset' ? 'Prompts' : 'Glossary Items'}
                            </h3>
                            <Button variant="ghost" size="sm" onClick={mode === 'preset' ? handleCreatePreset : handleCreateFragment}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Mobile: Fixed Height 300px. Desktop: Fixed Height 600px + Inner Scroll */}
                        <div className="h-[300px] md:h-[600px] md:flex-none relative border rounded-md md:border-0 md:rounded-none overflow-hidden flex flex-col min-h-0 bg-muted/10 md:bg-transparent">
                            <ScrollArea className="h-full w-full">
                                <div className="space-y-2 p-2 md:p-0 md:pb-4 md:pr-3">
                                    {mode === 'preset' ? (
                                        presets.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => setSelectedPresetId(p.id)}
                                                className={`flex flex-col p-3 rounded-md cursor-pointer transition-colors border ${selectedPresetId === p.id
                                                    ? 'bg-accent/50 border-accent-foreground/20'
                                                    : 'hover:bg-muted/50 border-transparent'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-medium text-sm truncate flex-1 text-left">{p.name}</span>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        {activePresetId === p.id && (
                                                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Active</Badge>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeletePreset(p.id);
                                                            }}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-muted-foreground truncate mt-1">{p.description}</span>
                                            </div>
                                        ))
                                    ) : (
                                        fragments.length === 0 ? (
                                            <div className="text-sm text-muted-foreground text-center py-4">No items created yet.</div>
                                        ) : (
                                            fragments.map(p => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => setSelectedFragmentId(p.id)}
                                                    className={`flex flex-col p-3 rounded-md cursor-pointer transition-colors border ${selectedFragmentId === p.id
                                                        ? 'bg-accent/50 border-accent-foreground/20'
                                                        : 'hover:bg-muted/50 border-transparent'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-medium text-sm truncate flex-1 text-left">{p.name}</span>
                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            {activeFragmentIds.includes(p.id) && (
                                                                <Badge variant="outline" className="border-green-500 text-green-500 text-[10px] h-5 px-1.5">On</Badge>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteFragment(p.id);
                                                                }}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground truncate mt-1">{p.description}</span>
                                                </div>
                                            ))
                                        )
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>

                    {/* --- EDITOR MAIN --- */}
                    <div className="flex-1 flex flex-col min-w-0 md:h-[600px] md:min-h-0 overflow-hidden">
                        {((mode === 'preset' && selectedPresetId) || (mode === 'fragment' && selectedFragmentId)) ? (
                            <>
                                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                                        <h3 className="font-bold text-lg whitespace-nowrap">Edit {mode === 'preset' ? 'Prompt' : 'Item'}</h3>
                                        {mode === 'preset' ? (
                                            selectedPresetId === activePresetId ? (
                                                <Badge variant="outline" className="ml-2 border-green-500 text-green-500 gap-1 whitespace-nowrap">
                                                    <Check className="h-3 w-3" /> Active
                                                </Badge>
                                            ) : (
                                                <Button variant="outline" size="sm" className="h-7 text-xs ml-2 whitespace-nowrap" onClick={() => handleActivatePreset(selectedPresetId)}>
                                                    Set Active
                                                </Button>
                                            )
                                        ) : (
                                            // Fragment Mode
                                            activeFragmentIds.includes(selectedFragmentId!) ? (
                                                <Button variant="outline" size="sm" className="h-7 text-xs ml-2 border-green-500 text-green-500 bg-green-500/10 hover:bg-green-500/20 whitespace-nowrap" onClick={() => handleToggleFragment(selectedFragmentId!)}>
                                                    Enabled
                                                </Button>
                                            ) : (
                                                <Button variant="outline" size="sm" className="h-7 text-xs ml-2 whitespace-nowrap" onClick={() => handleToggleFragment(selectedFragmentId!)}>
                                                    Enable
                                                </Button>
                                            )
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                                        <Button onClick={mode === 'preset' ? handleSavePreset : handleSaveFragment} size="sm" className="gap-2">
                                            <Save className="h-4 w-4" /> Save
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1 flex flex-col min-h-0 overflow-y-auto pr-1 pb-4">
                                    <div className="grid w-full items-center gap-1.5 flex-shrink-0">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                    </div>

                                    <div className="grid w-full items-center gap-1.5 flex-shrink-0">
                                        <Label htmlFor="desc">Description</Label>
                                        <Input id="desc" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Usage description" />
                                    </div>

                                    <div className="grid w-full gap-1.5 flex-1 min-h-[200px] flex flex-col">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="content">Content</Label>
                                            <div className="text-xs text-muted-foreground space-x-2">
                                                <span className="bg-muted px-1.5 py-0.5 rounded cursor-help">{"{{source_lang}}"}</span>
                                                <span className="bg-muted px-1.5 py-0.5 rounded cursor-help">{"{{target_lang}}"}</span>
                                            </div>
                                        </div>
                                        <Textarea
                                            id="content"
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="font-mono text-sm resize-none flex-1"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground py-12 md:py-0 bg-muted/10 rounded-md border border-dashed">
                                Select an item to edit
                            </div>
                        )}
                    </div>
                </div>
            </Tabs>
        </div>
    );
};

export default Prompts;
