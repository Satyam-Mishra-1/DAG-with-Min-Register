import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { OptimizationStep } from '@/utils/optimizer';

interface OptimizationTabsProps {
  copyPropagationSteps: OptimizationStep[];
  constantPropagationSteps: OptimizationStep[];
  constantFoldingSteps: OptimizationStep[];
  cseSteps: OptimizationStep[];
  deadCodeSteps: OptimizationStep[];
}

const OptimizationTabs: React.FC<OptimizationTabsProps> = ({
  copyPropagationSteps,
  constantPropagationSteps,
  constantFoldingSteps,
  cseSteps,
  deadCodeSteps
}) => {
  const [activeTab, setActiveTab] = useState("copy-prop");

  const renderSteps = (steps: OptimizationStep[]) => {
    if (!steps || steps.length === 0) {
      return <p className="text-gray-500">No optimization steps to display.</p>;
    }

    return (
      <div className="space-y-6 mt-4">
        {steps.map((step, idx) => (
          <div key={idx} className="border rounded-md p-4 animation-step">
            <h4 className="font-semibold mb-2">{step.description}</h4>
            {step.affectedLines.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-900 p-3 rounded-md overflow-x-auto">
                  <h5 className="text-gray-300 text-sm mb-2">Before:</h5>
                  <pre className="text-sm overflow-auto whitespace-pre-wrap text-gray-200">
                    {step.before.map((instr, i) => (
                      <div key={`before-${i}`} className="py-1">
                        <span className="opacity-70 mr-2">{instr.lineNumber}:</span>
                        {instr.raw}
                      </div>
                    ))}
                  </pre>
                </div>
                <div className="bg-gray-900 p-3 rounded-md overflow-x-auto">
                  <h5 className="text-gray-300 text-sm mb-2">After:</h5>
                  <pre className="text-sm overflow-auto whitespace-pre-wrap text-gray-200">
                    {step.after.map((instr, i) => (
                      <div key={`after-${i}`} className="py-1">
                        <span className="opacity-70 mr-2">{instr.lineNumber}:</span>
                        {instr.raw}
                      </div>
                    ))}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">{step.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="mt-8 w-full">
      <CardContent className="p-4">
        <h3 className="text-xl font-bold mb-4 text-center">Optimization Process</h3>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto scrollbar-hide">
            <TabsList className="flex w-max min-w-full space-x-2 mb-6 px-1">
              <TabsTrigger value="copy-prop" className="whitespace-nowrap px-4 py-2 rounded-md text-sm data-[state=active]:bg-optimization-copyProp data-[state=active]:text-white">
                Copy Propagation
              </TabsTrigger>
              <TabsTrigger value="const-prop" className="whitespace-nowrap px-4 py-2 rounded-md text-sm data-[state=active]:bg-optimization-constProp data-[state=active]:text-white">
                Constant Propagation
              </TabsTrigger>
              <TabsTrigger value="const-fold" className="whitespace-nowrap px-4 py-2 rounded-md text-sm data-[state=active]:bg-optimization-constFold data-[state=active]:text-white">
                Constant Folding
              </TabsTrigger>
              <TabsTrigger value="cse" className="whitespace-nowrap px-4 py-2 rounded-md text-sm data-[state=active]:bg-optimization-cse data-[state=active]:text-white">
                CSE
              </TabsTrigger>
              <TabsTrigger value="dead-code" className="whitespace-nowrap px-4 py-2 rounded-md text-sm data-[state=active]:bg-optimization-deadCode data-[state=active]:text-white">
                Dead Code
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="copy-prop" className="space-y-4 optimization-step">
            <div className="bg-optimization-copyProp/10 p-4 rounded-md">
              <h4 className="text-optimization-copyProp font-semibold mb-2">Copy Propagation</h4>
              <p>Copy propagation replaces the occurrences of variables with their assigned values to eliminate redundant assignments.</p>
            </div>
            {renderSteps(copyPropagationSteps)}
          </TabsContent>

          <TabsContent value="const-prop" className="space-y-4 optimization-step">
            <div className="bg-optimization-constProp/10 p-4 rounded-md">
              <h4 className="text-optimization-constProp font-semibold mb-2">Constant Propagation</h4>
              <p>Constant propagation replaces variables that have been assigned constant values with those constants directly.</p>
            </div>
            {renderSteps(constantPropagationSteps)}
          </TabsContent>

          <TabsContent value="const-fold" className="space-y-4 optimization-step">
            <div className="bg-optimization-constFold/10 p-4 rounded-md">
              <h4 className="text-optimization-constFold font-semibold mb-2">Constant Folding</h4>
              <p>Constant folding evaluates constant expressions at compile time to reduce runtime computation.</p>
            </div>
            {renderSteps(constantFoldingSteps)}
          </TabsContent>

          <TabsContent value="cse" className="space-y-4 optimization-step">
            <div className="bg-optimization-cse/10 p-4 rounded-md">
              <h4 className="text-optimization-cse font-semibold mb-2">Common Subexpression Elimination</h4>
              <p>CSE identifies and removes redundant computations by reusing previously computed values.</p>
            </div>
            {renderSteps(cseSteps)}
          </TabsContent>

          <TabsContent value="dead-code" className="space-y-4 optimization-step">
            <div className="bg-optimization-deadCode/10 p-4 rounded-md">
              <h4 className="text-optimization-deadCode font-semibold mb-2">Dead Code Elimination</h4>
              <p>Dead code elimination removes code that does not affect the program's output or behavior.</p>
            </div>
            {renderSteps(deadCodeSteps)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OptimizationTabs;
