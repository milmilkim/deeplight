import { useTranslations } from 'next-intl';
import { Textarea } from '../ui/textarea';
import clsx from 'clsx';
import React, { ChangeEventHandler, ReactNode } from 'react';

interface ContentTextareaProps {
  isTranslating?: boolean;
  value?: string;
  className?: string;
  onChange?: ChangeEventHandler;
  name?: string;
  placeholder?: string;
  footer?: ReactNode
}

const ContentTextarea = ({
  isTranslating,
  value,
  className,
  onChange,
  ...props
}: ContentTextareaProps & React.ComponentProps<'textarea'>) => {
  const t = useTranslations('textTranslate');

  return (
    <div className="h-full">
      <Textarea
        className={clsx('h-full min-h-64', className)}
        name={props.name ?? 'text'}
        disabled={isTranslating}
        value={value}
        onChange={onChange}
        {...props}
      />
      <div className="sticky bottom-0 py-2 flex items-center gap-1 justify-end">
        {props.footer}
      </div>
    </div>
  );
};

export default ContentTextarea;
