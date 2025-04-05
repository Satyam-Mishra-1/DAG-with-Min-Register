
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sampleTACCode } from '@/utils/tacParser';
import { Upload } from 'lucide-react';

interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  onOptimize: () => void;
}

const CodeInput: React.FC<CodeInputProps> = ({ code, setCode, onOptimize }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCode(text);
    };
    reader.readAsText(file);
  };

  const loadSampleCode = () => {
    setCode(sampleTACCode);
  };

  const handleOptimize = () => {
    setIsLoading(true);
    setTimeout(() => {
      onOptimize();
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Three Address Code Input</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadSampleCode}>
            Load Sample Code
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".txt,.c,.tac"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button 
              variant="outline" 
              size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </div>
      <Textarea
        className="font-mono text-sm min-h-[240px] bg-code text-code-foreground p-4"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter or paste three address code here..."
      />
      <div className="flex justify-end">
        <Button 
          onClick={handleOptimize}
          disabled={!code.trim() || isLoading}
          className="bg-accent hover:bg-accent/90">
          {isLoading ? 'Optimizing...' : 'Optimize Code'}
        </Button>
      </div>
    </div>
  );
};

export default CodeInput;
