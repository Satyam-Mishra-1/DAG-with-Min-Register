import { TACInstruction, TACType } from './tacParser';

// Store optimization steps for visualization
export interface OptimizationStep {
  type: string;
  description: string;
  before: TACInstruction[];
  after: TACInstruction[];
  affectedLines: number[];
}

export interface OptimizationResult {
  originalCode: TACInstruction[];
  optimizedCode: TACInstruction[];
  copyPropagationSteps: OptimizationStep[];
  constantPropagationSteps: OptimizationStep[];
  constantFoldingSteps: OptimizationStep[];
  cseSteps: OptimizationStep[]; // Common Subexpression Elimination
  deadCodeSteps: OptimizationStep[];
}

export function optimizeTAC(instructions: TACInstruction[]): OptimizationResult {
  let currentCode = [...instructions];
  const result: OptimizationResult = {
    originalCode: instructions,
    optimizedCode: [],
    copyPropagationSteps: [],
    constantPropagationSteps: [],
    constantFoldingSteps: [],
    cseSteps: [],
    deadCodeSteps: []
  };
  
  // Copy Propagation
  const copyPropResult = applyCopyPropagation(currentCode);
  result.copyPropagationSteps = copyPropResult.steps;
  currentCode = copyPropResult.code;
  
  // Constant Propagation
  const constPropResult = applyConstantPropagation(currentCode);
  result.constantPropagationSteps = constPropResult.steps;
  currentCode = constPropResult.code;
  
  // Constant Folding
  const constFoldResult = applyConstantFolding(currentCode);
  result.constantFoldingSteps = constFoldResult.steps;
  currentCode = constFoldResult.code;
  
  // Common Subexpression Elimination
  const cseResult = applyCSE(currentCode);
  result.cseSteps = cseResult.steps;
  currentCode = cseResult.code;
  
  // Dead Code Elimination
  const deadCodeResult = applyDeadCodeElimination(currentCode);
  result.deadCodeSteps = deadCodeResult.steps;
  currentCode = deadCodeResult.code;
  
  result.optimizedCode = currentCode;
  return result;
}

// Copy Propagation
function applyCopyPropagation(instructions: TACInstruction[]): { code: TACInstruction[], steps: OptimizationStep[] } {
  const steps: OptimizationStep[] = [];
  const copies: Record<string, string> = {}; // Map of variable to its copy source
  let modified = false;
  
  // First pass: identify copy assignments (t2 = t1)
  instructions.forEach(instr => {
    if (instr.type === TACType.ASSIGNMENT && 
        instr.result && 
        instr.op1 && 
        !instr.op1.match(/^\d+$/)) { // Not copying a constant
      copies[instr.result] = instr.op1;
    }
  });
  
  // Second pass: replace variables with their copies
  const result = instructions.map(instr => {
    const before = {...instr};
    let changed = false;
    
    // Replace operand 1 if it's a copy
    if (instr.op1 && copies[instr.op1]) {
      instr = {...instr, op1: copies[instr.op1]};
      changed = true;
    }
    
    // Replace operand 2 if it's a copy
    if (instr.op2 && copies[instr.op2]) {
      instr = {...instr, op2: copies[instr.op2]};
      changed = true;
    }
    
    // If instruction was changed, record this optimization step
    if (changed) {
      modified = true;
      steps.push({
        type: 'Copy Propagation',
        description: `Replaced variable with its copy in line ${instr.lineNumber}`,
        before: [before],
        after: [instr],
        affectedLines: [instr.lineNumber]
      });
      
      // Update the raw representation
      if (instr.type === TACType.BINARY_OP && instr.result && instr.op1 && instr.op2 && instr.operator) {
        instr.raw = `${instr.result} = ${instr.op1} ${instr.operator} ${instr.op2}`;
      } else if (instr.type === TACType.ASSIGNMENT && instr.result && instr.op1) {
        instr.raw = `${instr.result} = ${instr.op1}`;
      }
    }
    
    return instr;
  });
  
  // If no changes were made, add a step indicating no optimizations were possible
  if (!modified) {
    steps.push({
      type: 'Copy Propagation',
      description: 'No copy propagation opportunities found',
      before: instructions,
      after: instructions,
      affectedLines: []
    });
  }
  
  return { code: result, steps };
}

// Constant Propagation
function applyConstantPropagation(instructions: TACInstruction[]): { code: TACInstruction[], steps: OptimizationStep[] } {
  const steps: OptimizationStep[] = [];
  const constants: Record<string, string> = {}; // Map of variable to its constant value
  let modified = false;
  
  // First pass: identify constant assignments (t1 = 5)
  instructions.forEach(instr => {
    if (instr.type === TACType.ASSIGNMENT && 
        instr.result && 
        instr.op1 && 
        instr.op1.match(/^\d+$/)) { // Direct constant assignment
      constants[instr.result] = instr.op1;
    }
  });
  
  // Second pass: replace variables with their constant values
  const result = instructions.map(instr => {
    const before = {...instr};
    let changed = false;
    
    // Replace operand 1 if it's a constant
    if (instr.op1 && constants[instr.op1]) {
      instr = {...instr, op1: constants[instr.op1]};
      changed = true;
    }
    
    // Replace operand 2 if it's a constant
    if (instr.op2 && constants[instr.op2]) {
      instr = {...instr, op2: constants[instr.op2]};
      changed = true;
    }
    
    // If instruction was changed, record this optimization step
    if (changed) {
      modified = true;
      steps.push({
        type: 'Constant Propagation',
        description: `Replaced variable with constant value in line ${instr.lineNumber}`,
        before: [before],
        after: [instr],
        affectedLines: [instr.lineNumber]
      });
      
      // Update the raw representation
      if (instr.type === TACType.BINARY_OP && instr.result && instr.op1 && instr.op2 && instr.operator) {
        instr.raw = `${instr.result} = ${instr.op1} ${instr.operator} ${instr.op2}`;
      } else if (instr.type === TACType.ASSIGNMENT && instr.result && instr.op1) {
        instr.raw = `${instr.result} = ${instr.op1}`;
      }
    }
    
    return instr;
  });
  
  // If no changes were made, add a step indicating no optimizations were possible
  if (!modified) {
    steps.push({
      type: 'Constant Propagation',
      description: 'No constant propagation opportunities found',
      before: instructions,
      after: instructions,
      affectedLines: []
    });
  }
  
  return { code: result, steps };
}

// Constant Folding
function applyConstantFolding(instructions: TACInstruction[]): { code: TACInstruction[], steps: OptimizationStep[] } {
  const steps: OptimizationStep[] = [];
  let modified = false;
  
  const result = instructions.map(instr => {
    const before = {...instr};
    let changed = false;
    
    // Check if it's a binary operation with two constant operands
    if (instr.type === TACType.BINARY_OP && 
        instr.op1 && 
        instr.op2 && 
        instr.operator &&
        instr.op1.match(/^\d+$/) && 
        instr.op2.match(/^\d+$/)) {
        
      const val1 = parseInt(instr.op1);
      const val2 = parseInt(instr.op2);
      let result: number | undefined;
      
      // Perform the operation
      switch (instr.operator) {
        case '+': result = val1 + val2; break;
        case '-': result = val1 - val2; break;
        case '*': result = val1 * val2; break;
        case '/': 
          if (val2 !== 0) {
            result = Math.floor(val1 / val2);
          }
          break;
      }
      
      // If we successfully computed the result
      if (result !== undefined) {
        const newInstr = {
          ...instr,
          type: TACType.ASSIGNMENT,
          op1: result.toString(),
          op2: undefined,
          operator: undefined,
          raw: `${instr.result} = ${result}`
        };
        
        changed = true;
        modified = true;
        steps.push({
          type: 'Constant Folding',
          description: `Folded constant expression in line ${instr.lineNumber}`,
          before: [before],
          after: [newInstr],
          affectedLines: [instr.lineNumber]
        });
        
        return newInstr;
      }
    }
    
    return instr;
  });
  
  // If no changes were made, add a step indicating no optimizations were possible
  if (!modified) {
    steps.push({
      type: 'Constant Folding',
      description: 'No constant folding opportunities found',
      before: instructions,
      after: instructions,
      affectedLines: []
    });
  }
  
  return { code: result, steps };
}

// Common Subexpression Elimination
function applyCSE(instructions: TACInstruction[]): { code: TACInstruction[], steps: OptimizationStep[] } {
  const steps: OptimizationStep[] = [];
  const expressions: Record<string, string> = {}; // Map of expression hash to its result variable
  let modified = false;
  
  const result = [...instructions];
  
  // Find common subexpressions (very simplified version)
  for (let i = 0; i < result.length; i++) {
    const instr = result[i];
    
    if (instr.type === TACType.BINARY_OP && 
        instr.op1 && 
        instr.op2 && 
        instr.operator &&
        instr.result) {
        
      // Create a hash of this expression
      const exprHash = `${instr.op1}${instr.operator}${instr.op2}`;
      
      if (expressions[exprHash]) {
        // We found a common subexpression
        const before = {...instr};
        
        // Replace with an assignment from the previous computed result
        const newInstr: TACInstruction = {
          type: TACType.ASSIGNMENT,
          result: instr.result,
          op1: expressions[exprHash],
          lineNumber: instr.lineNumber,
          raw: `${instr.result} = ${expressions[exprHash]}`
        };
        
        result[i] = newInstr;
        modified = true;
        steps.push({
          type: 'Common Subexpression Elimination',
          description: `Eliminated common subexpression in line ${instr.lineNumber}`,
          before: [before],
          after: [newInstr],
          affectedLines: [instr.lineNumber]
        });
      } else {
        // Record this expression for future reference
        expressions[exprHash] = instr.result;
      }
    }
  }
  
  // If no changes were made, add a step indicating no optimizations were possible
  if (!modified) {
    steps.push({
      type: 'Common Subexpression Elimination',
      description: 'No common subexpressions found',
      before: instructions,
      after: instructions,
      affectedLines: []
    });
  }
  
  return { code: result, steps };
}

// Dead Code Elimination
function applyDeadCodeElimination(instructions: TACInstruction[]): { code: TACInstruction[], steps: OptimizationStep[] } {
  const steps: OptimizationStep[] = [];
  const usedVariables = new Set<string>();
  const deadAssignments: number[] = [];
  let modified = false;
  
  // Simple approach: find variables that are assigned but never used
  
  // First pass: find all variables that are used
  instructions.forEach(instr => {
    if (instr.op1 && !instr.op1.match(/^\d+$/)) {
      usedVariables.add(instr.op1);
    }
    if (instr.op2 && !instr.op2.match(/^\d+$/)) {
      usedVariables.add(instr.op2);
    }
    if (instr.condition) {
      // Extract variables from condition
      const condVars = instr.condition.match(/[a-zA-Z][a-zA-Z0-9_]*/g);
      if (condVars) {
        condVars.forEach(v => usedVariables.add(v));
      }
    }
  });
  
  // Second pass: find assignments to variables that are never used
  instructions.forEach((instr, index) => {
    if ((instr.type === TACType.ASSIGNMENT || instr.type === TACType.BINARY_OP) && 
        instr.result && 
        !usedVariables.has(instr.result)) {
      deadAssignments.push(instr.lineNumber);
    }
  });
  
  // Only mark as dead if there are no side effects (simplified)
  const result = instructions.filter((instr, index) => {
    if (deadAssignments.includes(instr.lineNumber)) {
      modified = true;
      steps.push({
        type: 'Dead Code Elimination',
        description: `Removed unused assignment in line ${instr.lineNumber}`,
        before: [instr],
        after: [],
        affectedLines: [instr.lineNumber]
      });
      return false; // Remove this instruction
    }
    return true; // Keep this instruction
  });
  
  // If no changes were made, add a step indicating no optimizations were possible
  if (!modified) {
    steps.push({
      type: 'Dead Code Elimination',
      description: 'No dead code found',
      before: instructions,
      after: instructions,
      affectedLines: []
    });
  }
  
  return { code: result, steps };
}

// Generate liveness analysis data
export function generateLivenessAnalysis(instructions: TACInstruction[]) {
  const blocks: number[][] = []; // Basic blocks as arrays of instruction indices
  let currentBlock: number[] = [];
  
  // Identify basic blocks
  instructions.forEach((instr, index) => {
    if (instr.type === TACType.LABEL) {
      if (currentBlock.length > 0) {
        blocks.push([...currentBlock]);
        currentBlock = [];
      }
    }
    
    currentBlock.push(index);
    
    if (instr.type === TACType.JUMP || instr.type === TACType.CONDITIONAL_JUMP) {
      blocks.push([...currentBlock]);
      currentBlock = [];
    }
  });
  
  if (currentBlock.length > 0) {
    blocks.push([...currentBlock]);
  }
  
  // For demonstration, generate simulated liveness data
  const liveness: { [key: number]: string[] } = {};
  let allVars: string[] = [];
  
  // Collect all variables
  instructions.forEach(instr => {
    if (instr.result && instr.result.match(/^[a-zA-Z]/)) {
      if (!allVars.includes(instr.result)) allVars.push(instr.result);
    }
    if (instr.op1 && instr.op1.match(/^[a-zA-Z]/)) {
      if (!allVars.includes(instr.op1)) allVars.push(instr.op1);
    }
    if (instr.op2 && instr.op2.match(/^[a-zA-Z]/)) {
      if (!allVars.includes(instr.op2)) allVars.push(instr.op2);
    }
  });
  
  // Simulate liveness analysis results
  instructions.forEach((instr, index) => {
    const liveVars = [];
    
    // For each instruction, randomly pick some variables to be "live"
    for (const v of allVars) {
      // Variables used in this instruction are definitely live
      if ((instr.op1 === v || instr.op2 === v) && instr.result !== v) {
        liveVars.push(v);
      } 
      // Otherwise randomly decide
      else if (Math.random() > 0.6 && instr.result !== v) {
        liveVars.push(v);
      }
    }
    
    liveness[index] = liveVars;
  });
  
  return {
    blocks,
    liveness
  };
}

// Generate register allocation data based on graph coloring
export function generateRegisterAllocation(instructions: TACInstruction[]) {
  // Generate simulated register allocation data for visualization purposes
  
  // Collect all variables
  const variables = new Set<string>();
  instructions.forEach(instr => {
    if (instr.result && instr.result.match(/^[a-zA-Z]/)) variables.add(instr.result);
    if (instr.op1 && instr.op1.match(/^[a-zA-Z]/)) variables.add(instr.op1);
    if (instr.op2 && instr.op2.match(/^[a-zA-Z]/)) variables.add(instr.op2);
  });
  
  const variablesArray = Array.from(variables);
  
  // Create an interference graph (simplified)
  const interferenceGraph: Record<string, string[]> = {};
  variablesArray.forEach(v => {
    interferenceGraph[v] = [];
  });
  
  // Add random interference edges (in a real implementation this would be based on liveness)
  variablesArray.forEach((v1, i) => {
    variablesArray.forEach((v2, j) => {
      if (i !== j && Math.random() > 0.5) {
        if (!interferenceGraph[v1].includes(v2)) {
          interferenceGraph[v1].push(v2);
        }
        if (!interferenceGraph[v2].includes(v1)) {
          interferenceGraph[v2].push(v1);
        }
      }
    });
  });
  
  // Simplified graph coloring algorithm
  const colors: Record<string, number> = {};
  const availableColors = [0, 1, 2, 3]; // Representing registers R0, R1, R2, R3
  
  variablesArray.forEach(v => {
    const usedColors = new Set(
      interferenceGraph[v]
        .filter(neighbor => colors[neighbor] !== undefined)
        .map(neighbor => colors[neighbor])
    );
    
    // Find the first available color
    const color = availableColors.find(c => !usedColors.has(c)) ?? 0;
    colors[v] = color;
  });
  
  // Map variables to registers
  const registerMapping: Record<string, string> = {};
  Object.entries(colors).forEach(([variable, color]) => {
    registerMapping[variable] = `R${color}`;
  });
  
  // Generate optimized code with registers
  const optimizedWithRegisters = instructions.map(instr => {
    const newInstr = {...instr};
    
    if (newInstr.result && registerMapping[newInstr.result]) {
      newInstr.result = registerMapping[newInstr.result];
    }
    
    if (newInstr.op1 && registerMapping[newInstr.op1]) {
      newInstr.op1 = registerMapping[newInstr.op1];
    }
    
    if (newInstr.op2 && registerMapping[newInstr.op2]) {
      newInstr.op2 = registerMapping[newInstr.op2];
    }
    
    // Update raw representation
    if (newInstr.type === TACType.BINARY_OP && newInstr.result && newInstr.op1 && newInstr.op2 && newInstr.operator) {
      newInstr.raw = `${newInstr.result} = ${newInstr.op1} ${newInstr.operator} ${newInstr.op2}`;
    } else if (newInstr.type === TACType.ASSIGNMENT && newInstr.result && newInstr.op1) {
      newInstr.raw = `${newInstr.result} = ${newInstr.op1}`;
    }
    
    return newInstr;
  });
  
  return {
    interferenceGraph,
    registerMapping,
    optimizedWithRegisters
  };
}

// Generate DAG (Directed Acyclic Graph) representation
export interface DAGNode {
  id: string;
  label: string;
  type: 'operator' | 'variable' | 'constant';
  children: string[];
}

export function generateDAG(instructions: TACInstruction[]) {
  const nodes: Record<string, DAGNode> = {};
  const nodeIds: Record<string, string> = {}; // Maps expression signatures to node IDs
  let nextId = 1;
  
  // Function to generate a unique node ID
  const getNextId = () => `n${nextId++}`;
  
  // Process each instruction to build the DAG
  instructions.forEach(instr => {
    if (instr.type === TACType.BINARY_OP && instr.result && instr.op1 && instr.op2 && instr.operator) {
      // Get or create nodes for operands
      let op1Id;
      if (instr.op1.match(/^\d+$/)) {
        // Constant
        const signature = `const:${instr.op1}`;
        if (!nodeIds[signature]) {
          const id = getNextId();
          nodes[id] = {
            id,
            label: instr.op1,
            type: 'constant',
            children: []
          };
          nodeIds[signature] = id;
        }
        op1Id = nodeIds[signature];
      } else {
        // Variable
        const signature = `var:${instr.op1}`;
        if (!nodeIds[signature]) {
          const id = getNextId();
          nodes[id] = {
            id,
            label: instr.op1,
            type: 'variable',
            children: []
          };
          nodeIds[signature] = id;
        }
        op1Id = nodeIds[signature];
      }
      
      // Same for op2
      let op2Id;
      if (instr.op2.match(/^\d+$/)) {
        const signature = `const:${instr.op2}`;
        if (!nodeIds[signature]) {
          const id = getNextId();
          nodes[id] = {
            id,
            label: instr.op2,
            type: 'constant',
            children: []
          };
          nodeIds[signature] = id;
        }
        op2Id = nodeIds[signature];
      } else {
        const signature = `var:${instr.op2}`;
        if (!nodeIds[signature]) {
          const id = getNextId();
          nodes[id] = {
            id,
            label: instr.op2,
            type: 'variable',
            children: []
          };
          nodeIds[signature] = id;
        }
        op2Id = nodeIds[signature];
      }
      
      // Check if this operation already exists
      const opSignature = `op:${instr.operator}:${op1Id}:${op2Id}`;
      let opId;
      
      if (!nodeIds[opSignature]) {
        // Create new operator node
        opId = getNextId();
        nodes[opId] = {
          id: opId,
          label: instr.operator,
          type: 'operator',
          children: [op1Id, op2Id]
        };
        nodeIds[opSignature] = opId;
      } else {
        opId = nodeIds[opSignature];
      }
      
      // Map result variable to this operation
      nodeIds[`var:${instr.result}`] = opId;
      
    } else if (instr.type === TACType.ASSIGNMENT && instr.result && instr.op1) {
      // Handle simple assignments
      let sourceId;
      
      if (instr.op1.match(/^\d+$/)) {
        // Constant assignment
        const signature = `const:${instr.op1}`;
        if (!nodeIds[signature]) {
          const id = getNextId();
          nodes[id] = {
            id,
            label: instr.op1,
            type: 'constant',
            children: []
          };
          nodeIds[signature] = id;
        }
        sourceId = nodeIds[signature];
      } else {
        // Variable assignment
        const signature = `var:${instr.op1}`;
        if (!nodeIds[signature]) {
          const id = getNextId();
          nodes[id] = {
            id,
            label: instr.op1,
            type: 'variable',
            children: []
          };
          nodeIds[signature] = id;
        }
        sourceId = nodeIds[signature];
      }
      
      // Map result to source
      nodeIds[`var:${instr.result}`] = sourceId;
    }
  });
  
  return {
    nodes,
    roots: Object.keys(nodes).filter(id => {
      // Nodes that have no parent are roots
      return !Object.values(nodes).some(node => node.children.includes(id));
    })
  };
}
