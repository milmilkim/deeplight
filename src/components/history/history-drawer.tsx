import React, { useState } from 'react';
import { useHistoryStore, HistoryItem } from '@/stores/historyStore';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { History, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const HistoryItemRow = ({
    item,
    removeFromHistory,
    formatDate
}: {
    item: HistoryItem;
    removeFromHistory: (id: string) => void;
    formatDate: (timestamp: number) => string;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={cn(
                "flex flex-col gap-2 rounded-lg border p-3 text-sm transition-colors group relative",
                isExpanded ? "bg-muted/30" : "hover:bg-muted/50"
            )}
        >
            <div className="absolute top-2 right-2 flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? "Collapse" : "Expand"}
                >
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromHistory(item.id)}
                    title="Remove"
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>

            <div className="font-medium text-muted-foreground text-xs flex items-center justify-between pr-14">
                <span>{item.provider}</span>
                <span>{formatDate(item.timestamp)}</span>
            </div>

            <div className="grid gap-1">
                <div className={cn("text-muted-foreground", !isExpanded && "line-clamp-2")}>
                    {item.sourceText}
                </div>
                <div className={cn("font-medium text-foreground", !isExpanded ? "line-clamp-3" : "whitespace-pre-wrap")}>
                    {item.translatedText}
                </div>
            </div>
        </div>
    );
};

const HistoryDrawer = () => {
    const { history, clearHistory, removeFromHistory } = useHistoryStore();

    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        }).format(new Date(timestamp));
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" title="Translation History">
                    <History className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                <SheetHeader>
                    <SheetTitle className="flex items-center justify-between">
                        <span>Translation History</span>
                        {history.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    if (confirm('Are you sure you want to clear all history?')) {
                                        clearHistory();
                                    }
                                }}
                                className="h-8 text-xs mr-8"
                            >
                                <Trash2 className="mr-2 h-3 w-3" />
                                Clear All
                            </Button>
                        )}
                    </SheetTitle>
                    <SheetDescription>
                        Recent translations are saved locally in your browser.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto mt-4 -mx-6 px-6">
                    <div className="space-y-4 pb-4 pr-4">
                        {history.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                No history yet.
                            </div>
                        ) : (
                            history.map((item) => (
                                <HistoryItemRow
                                    key={item.id}
                                    item={item}
                                    removeFromHistory={removeFromHistory}
                                    formatDate={formatDate}
                                />
                            ))
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default HistoryDrawer;
