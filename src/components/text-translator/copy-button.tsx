import { Button } from '../ui/button';
import { Clipboard } from 'lucide-react';

const CopyButton = ({ onClick }: { onClick?: () => void }) => (
  <div className="sticky bottom-0">
    <Button variant={'ghost'} size={'icon'} onClick={onClick}>
      <Clipboard />
    </Button>
  </div>
);

export default CopyButton;