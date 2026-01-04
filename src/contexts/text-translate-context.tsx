import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DeepLTranslateRequest } from '@/types/api';

interface TextTranslateContextType {
  transRequest: DeepLTranslateRequest;
  setTransRequest: React.Dispatch<React.SetStateAction<DeepLTranslateRequest>>;
  result: string;
  setResult: React.Dispatch<React.SetStateAction<string>>;
  billedCharacters: number;
  setBilledCharacters: React.Dispatch<React.SetStateAction<number>>;
}

const TextTranslateContext = createContext<TextTranslateContextType | undefined>(undefined);

interface TextTranslateProviderProps {
  children: ReactNode;
}

export const TextTranslateProvider: React.FC<TextTranslateProviderProps> = ({ children }) => {
  const [transRequest, setTransRequest] = useState<DeepLTranslateRequest>({
    sourceLang: '',
    targetLang: 'ko',
    text: '',
    modelType: undefined,
    formality: undefined,
    splitSentences: 'on',
    preserveFormatting: undefined,
    tagHandling: undefined,
    outlineDetection: undefined,
    splittingTags: undefined,
    nonSplittingTags: undefined,
    context: undefined,
  });

  const [result, setResult] = useState<string>('');
  const [billedCharacters, setBilledCharacters] = useState<number>(0);

  const value = {
    transRequest,
    setTransRequest,
    result,
    setResult,
    billedCharacters,
    setBilledCharacters,
  };

  return (
    <TextTranslateContext.Provider value={value}>
      {children}
    </TextTranslateContext.Provider>
  );
};

export const useTextTranslate = () => {
  const context = useContext(TextTranslateContext);
  if (context === undefined) {
    throw new Error('useTextTranslate must be used within a TextTranslateProvider');
  }
  return context;
};
