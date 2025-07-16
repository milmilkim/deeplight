import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useConfigStore } from '../stores/configStore';

const Config = () => {
  const [open, setOpen] = useState(false);
  const { config, saveConfig } = useConfigStore();
  const [tempConfig, setTempConfig] = useState(config);

  const handleSave = async () => {
    await saveConfig(tempConfig);
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempConfig({ ...tempConfig, apiKey: e.target.value });
  };

  useEffect(() => {
    setTempConfig(config);
  }, [config]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4">환경 설정</DialogTitle>
          <div className="flex w-full flex-col">
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="api-key">API KEY</Label>
              <Input
                type="password"
                id="api-key"
                placeholder="API KEY"
                value={tempConfig.apiKey}
                onChange={handleChange}
                name="apiKey"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">취소</Button>
              </DialogClose>
              <Button onClick={handleSave}>저장</Button>
            </DialogFooter>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default Config;
