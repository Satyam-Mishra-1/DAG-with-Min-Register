interface DAGNode {
    label: string;
    type: string;
    children: string[];
  }
  
  interface DAG {
    nodes: Record<string, DAGNode>;
    roots: string[];
  }
  
  export function getMinRegistersFromDAG(dag: DAG): number {
    const computedLabels: Record<string, number> = {};
  
    function computeLabel(nodeId: string): number {
      if (computedLabels[nodeId]) return computedLabels[nodeId];
  
      const node = dag.nodes[nodeId];
      if (!node || node.children.length === 0) {
        computedLabels[nodeId] = 1;
        return 1;
      }
  
      const childLabels = node.children.map(computeLabel);
      const label =
        node.children.length === 1
          ? Math.max(...childLabels)
          : 1 + Math.max(...childLabels);
  
      computedLabels[nodeId] = label;
      return label;
    }
  
    let maxLabel = 0;
    const roots = dag.roots.length > 0 ? dag.roots : Object.keys(dag.nodes);
    for (const rootId of roots) {
      maxLabel = Math.max(maxLabel, computeLabel(rootId));
    }
  
    return maxLabel;
  }
  