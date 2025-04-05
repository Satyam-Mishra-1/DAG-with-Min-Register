
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TACInstruction } from '@/utils/tacParser';

interface CodeComparisonProps {
  originalCode: TACInstruction[];
  optimizedCode: TACInstruction[];
}

const CodeComparison: React.FC<CodeComparisonProps> = ({ originalCode, optimizedCode }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-3">Original Code</h3>
          <div className="font-mono text-sm bg-code text-code-foreground p-4 rounded-md overflow-auto max-h-[400px]">
            <pre className="whitespace-pre-wrap">
              {originalCode.map((instr, index) => (
                <div 
                  key={`original-${index}`} 
                  className="py-1 border-b border-gray-700 last:border-0">
                  <span className="mr-2 text-gray-400">{instr.lineNumber}:</span>
                  {instr.raw}
                </div>
              ))}
            </pre>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-3">Optimized Code</h3>
          <div className="font-mono text-sm bg-code text-code-foreground p-4 rounded-md overflow-auto max-h-[400px]">
            <pre className="whitespace-pre-wrap">
              {optimizedCode.length > 0 ? (
                optimizedCode.map((instr, index) => (
                  <div 
                    key={`optimized-${index}`}
                    className="py-1 border-b border-gray-700 last:border-0">
                    <span className="mr-2 text-gray-400">{instr.lineNumber}:</span>
                    {instr.raw}
                  </div>
                ))
              ) : (
                <span className="text-gray-400">No optimized code yet. Click "Optimize Code" to generate.</span>
              )}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeComparison;
