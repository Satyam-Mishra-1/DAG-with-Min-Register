
import React, { useState } from 'react';
import { parseTAC, sampleTACCode } from '@/utils/tacParser';
import { optimizeTAC, generateLivenessAnalysis, generateRegisterAllocation, generateDAG, OptimizationResult } from '@/utils/optimizer';
import Header from '@/components/Header';
import CodeInput from '@/components/CodeInput';
import CodeComparison from '@/components/CodeComparison';
import OptimizationTabs from '@/components/OptimizationTabs';
import RegisterAllocation from '@/components/RegisterAllocation';
import DAGVisualization from '@/components/DAGVisualization';

const Index = () => {
  const [code, setCode] = useState(sampleTACCode);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [registerData, setRegisterData] = useState<any>(null);
  const [originalDAG, setOriginalDAG] = useState<any>(null);
  const [optimizedDAG, setOptimizedDAG] = useState<any>(null);

  const handleOptimize = () => {
    try {
      // Parse the code
      const parsedCode = parseTAC(code);
      
      // Get optimization results
      const result = optimizeTAC(parsedCode);
      
      // Generate register allocation data
      const registerAllocationData = generateRegisterAllocation(result.optimizedCode);
      
      // Generate DAG data for visualization
      const originalDAGData = generateDAG(result.originalCode);
      const optimizedDAGData = generateDAG(result.optimizedCode);
      
      // Update state
      setOptimizationResult(result);
      setRegisterData(registerAllocationData);
      setOriginalDAG(originalDAGData);
      setOptimizedDAG(optimizedDAGData);
      
    } catch (error) {
      console.error("Error optimizing code:", error);
      // In a real application, we would show an error message to the user
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        <div className="grid grid-cols-1 gap-8">
          <CodeInput 
            code={code} 
            setCode={setCode} 
            onOptimize={handleOptimize} 
          />
          
          {optimizationResult && (
            <>
              <CodeComparison 
                originalCode={optimizationResult.originalCode} 
                optimizedCode={optimizationResult.optimizedCode} 
              />
              
              <OptimizationTabs 
                copyPropagationSteps={optimizationResult.copyPropagationSteps}
                constantPropagationSteps={optimizationResult.constantPropagationSteps}
                constantFoldingSteps={optimizationResult.constantFoldingSteps}
                cseSteps={optimizationResult.cseSteps}
                deadCodeSteps={optimizationResult.deadCodeSteps}
              />
              
              {registerData && (
                <RegisterAllocation 
                  interferenceGraph={registerData.interferenceGraph}
                  registerMapping={registerData.registerMapping}
                  optimizedWithRegisters={registerData.optimizedWithRegisters}
                />
              )}
              
              {originalDAG && optimizedDAG && (
                <DAGVisualization 
                  originalDAG={originalDAG}
                  optimizedDAG={optimizedDAG}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
