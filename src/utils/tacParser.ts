
// TAC instruction types
export enum TACType {
  ASSIGNMENT,
  BINARY_OP,
  UNARY_OP,
  LABEL,
  JUMP,
  CONDITIONAL_JUMP,
  RETURN,
  PARAM,
  CALL,
  ARRAY_ACCESS,
  ARRAY_ASSIGNMENT
}

export interface TACInstruction {
  type: TACType;
  result?: string;
  op1?: string;
  op2?: string;
  operator?: string;
  label?: string;
  condition?: string;
  lineNumber: number;
  raw: string;
}

export function parseTAC(code: string): TACInstruction[] {
  const lines = code.split('\n');
  const instructions: TACInstruction[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine || trimmedLine.startsWith('//')) {
      return; // Skip empty lines and comments
    }
    
    // Basic instruction parsing
    let instruction: TACInstruction = {
      type: TACType.ASSIGNMENT,
      lineNumber: index + 1,
      raw: trimmedLine
    };
    
    if (trimmedLine.includes('=')) {
      // Handle assignment, binary op, unary op
      const [result, rest] = trimmedLine.split('=').map(s => s.trim());
      instruction.result = result;
      
      if (rest.includes('+') || rest.includes('-') || rest.includes('*') || rest.includes('/')) {
        // Binary operation
        instruction.type = TACType.BINARY_OP;
        
        // Simple regex to match binary operations
        const match = rest.match(/([a-zA-Z0-9_]+)\s*([+\-*/])\s*([a-zA-Z0-9_]+)/);
        if (match) {
          instruction.op1 = match[1];
          instruction.operator = match[2];
          instruction.op2 = match[3];
        }
      } else if (rest.startsWith('-') || rest.startsWith('!')) {
        // Unary operation
        instruction.type = TACType.UNARY_OP;
        instruction.operator = rest[0];
        instruction.op1 = rest.slice(1).trim();
      } else {
        // Simple assignment
        instruction.type = TACType.ASSIGNMENT;
        instruction.op1 = rest;
      }
    } else if (trimmedLine.startsWith('goto')) {
      // Jump instruction
      instruction.type = TACType.JUMP;
      instruction.label = trimmedLine.replace('goto', '').trim();
    } else if (trimmedLine.startsWith('if')) {
      // Conditional jump
      instruction.type = TACType.CONDITIONAL_JUMP;
      
      const match = trimmedLine.match(/if\s+(.+)\s+goto\s+(.+)/);
      if (match) {
        instruction.condition = match[1].trim();
        instruction.label = match[2].trim();
      }
    } else if (trimmedLine.endsWith(':')) {
      // Label
      instruction.type = TACType.LABEL;
      instruction.label = trimmedLine.slice(0, -1).trim();
    } else if (trimmedLine.startsWith('return')) {
      // Return instruction
      instruction.type = TACType.RETURN;
      instruction.op1 = trimmedLine.replace('return', '').trim();
    }
    
    instructions.push(instruction);
  });
  
  return instructions;
}

export function generateTACCode(instructions: TACInstruction[]): string {
  return instructions.map(instr => instr.raw).join('\n');
}

// Sample TAC code for demonstration
export const sampleTACCode = `// Sample Three Address Code
t1 = 10
t2 = 20
t3 = t1 + t2
t4 = t3 * 2
t5 = t4
t6 = t5
if t6 > 50 goto L1
t7 = 0
goto L2
L1:
t7 = 1
L2:
result = t7`;
