import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AiTextTranslateContextType {
  result: string;
  setResult: React.Dispatch<React.SetStateAction<string>>;
}

const TextTranslateContext = createContext<AiTextTranslateContextType | undefined>(undefined);

interface AiTextTranslateProviderProps {
  children: ReactNode;
}

export const TextTranslateProvider: React.FC<AiTextTranslateProviderProps> = ({ children }) => {
  const [result, setResult] = useState<string>('');
  const [billedCharacters, setBilledCharacters] = useState<number>(0);

  const value = {
    result,
    setResult,
  };

  return (
    <TextTranslateContext.Provider value={value}>
      {children}
    </TextTranslateContext.Provider>
  );
};

export const useAiTextTranslate = () => {
  const context = useContext(TextTranslateContext);
  if (context === undefined) {
    throw new Error('useTextTranslate must be used within a TextTranslateProvider');
  }
  return context;
};
