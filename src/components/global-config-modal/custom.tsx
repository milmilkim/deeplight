import { CustomProvider } from '@/types/global-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Plus, Trash2, Save, X, Edit2, Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { nanoid } from 'nanoid';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CustomProps {
    customProviders: CustomProvider[];
    updateCustomProviders: (updates: CustomProvider[]) => void;
}

const Custom = ({ customProviders, updateCustomProviders }: CustomProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState(''); // Model ID
    const [showApiKey, setShowApiKey] = useState(false);

    const handleAddNew = () => {
        setIsEditing(true);
        setEditId(null);
        setName('My Model');
        setBaseUrl('https://api.openai.com/v1/');
        setApiKey('');
        setModel('model-id');
        setShowApiKey(false);
    };

    const handleEdit = (provider: CustomProvider) => {
        setIsEditing(true);
        setEditId(provider.id);
        setName(provider.name);
        setBaseUrl(provider.baseUrl);
        setApiKey(provider.apiKey);
        setModel(provider.model);
        setShowApiKey(false);
    };

    const handleSave = () => {
        if (!name || !baseUrl || !model) {
            alert("Name, Base URL and Model ID are required");
            return;
        }

        if (editId) {
            // Update existing
            const newList = customProviders.map(p => p.id === editId ? {
                ...p,
                name, baseUrl, apiKey, model
            } : p);
            updateCustomProviders(newList);
        } else {
            // Create new
            const newProvider: CustomProvider = {
                id: nanoid(),
                name, baseUrl, apiKey, model
            };
            updateCustomProviders([...customProviders, newProvider]);
        }
        setIsEditing(false);
    };

    const handleDelete = (id: string) => {
        const newList = customProviders.filter(p => p.id !== id);
        updateCustomProviders(newList);
        if (editId === id) setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{editId ? 'Edit Provider' : 'New Provider'}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 min-h-0">
                    <div className="grid gap-1.5">
                        <Label>Display Name (Alias)</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="My Custom Model" />
                    </div>
                    <div className="grid gap-1.5">
                        <Label>Base URL</Label>
                        <Input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="grid gap-1.5">
                        <Label>API Key (Optional)</Label>
                        <div className="relative">
                            <Input
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                type={showApiKey ? "text" : "password"}
                                placeholder="sk-..."
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowApiKey(!showApiKey)}
                            >
                                {showApiKey ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-1.5">
                        <Label>Model ID (API Identifier)</Label>
                        <Input value={model} onChange={e => setModel(e.target.value)} placeholder="gpt-4-turbo" />
                    </div>
                </div>
                <Button onClick={handleSave} className="w-full mt-auto"><Save className="mr-2 h-4 w-4" /> Save</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold">Custom Providers</h3>
                <Button size="sm" onClick={handleAddNew}><Plus className="h-4 w-4" /></Button>
            </div>
            <ScrollArea className="flex-1 border rounded-md p-2 bg-muted/10 h-[400px]">
                {customProviders.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 text-sm">
                        No custom providers added.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {customProviders.map(p => (
                            <div key={p.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                                <div className="min-w-0 flex-1 mr-2">
                                    <div className="font-semibold text-sm truncate">{p.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{p.model}</div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Edit2 className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};

export default Custom;