import { useTranslations } from 'next-intl';
import { Textarea } from '../ui/textarea';
import clsx from 'clsx';
import React, { ChangeEventHandler } from 'react';

interface ContentTextareaProps {
  isTranslating?: boolean;
  value?: string;
  className?: string;
  onChange?: ChangeEventHandler;
  name?: string;
  placeholder?: string
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
    <Textarea
      className={clsx('h-full min-h-64', className)}
      name={name ?? 'text'}
      disabled={isTranslating}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
};

export default ContentTextarea;
