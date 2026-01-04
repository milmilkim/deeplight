import { AiTranslateRequest } from '@/types/api';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AiTextTranslateContextType {
  result: string;
  setResult: React.Dispatch<React.SetStateAction<string>>;
  transRequest: AiTranslateRequest;
  setTransRequest: React.Dispatch<React.SetStateAction<AiTranslateRequest>>;
}

const AiTextTranslateContext = createContext<
  AiTextTranslateContextType | undefined
>(undefined);

interface AiTextTranslateProviderProps {
  children: ReactNode;
}

export const AiTextTranslateProvider: React.FC<
  AiTextTranslateProviderProps
> = ({ children }) => {
  const [transRequest, setTransRequest] = useState<AiTranslateRequest>({
    text: '',
    sourceLang: '',
    targetLang: 'ko',
    model: 'gemini-3-flash-preview',
  });
  const [result, setResult] = useState<string>('');

  const value = {
    result,
    setResult,
    transRequest,
    setTransRequest,
  };

  return (
    <AiTextTranslateContext.Provider value={value}>
      {children}
    </AiTextTranslateContext.Provider>
  );
};

export const useAiTextTranslate = () => {
  const context = useContext(AiTextTranslateContext);
  if (context === undefined) {
    throw new Error(
      'useTextTranslate must be used within a TextTranslateProvider',
    );
  }
  return context;
};
