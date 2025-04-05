
// import React, { useEffect, useRef, useState } from 'react';
// import { Card, CardContent } from "@/components/ui/card";
// import { DAGNode } from '@/utils/optimizer';
// import * as d3 from 'd3';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// interface DAGVisualizationProps {
//   originalDAG: {
//     nodes: Record<string, DAGNode>;
//     roots: string[];
//   };
//   optimizedDAG: {
//     nodes: Record<string, DAGNode>;
//     roots: string[];
//   };
// }

// const DAGVisualization: React.FC<DAGVisualizationProps> = ({ originalDAG, optimizedDAG }) => {
//   const originalDagRef = useRef<SVGSVGElement>(null);
//   const optimizedDagRef = useRef<SVGSVGElement>(null);
//   const [activeTab, setActiveTab] = useState("original");
  
//   const renderDAG = (dagRef: React.RefObject<SVGSVGElement>, dag: { nodes: Record<string, DAGNode>; roots: string[] }) => {
//     if (!dagRef.current || !dag || !dag.nodes || Object.keys(dag.nodes).length === 0) return;
    
//     const svg = d3.select(dagRef.current);
//     svg.selectAll("*").remove();
    
//     const width = dagRef.current.clientWidth || 500;
//     const height = 500;
    
//     // Create a hierarchical structure for the DAG
//     const hierarchyData: any = { id: 'root', children: [] };
    
//     // Process nodes to create a hierarchy
//     const processedNodes = new Set<string>();
//     const processNode = (nodeId: string, parent: any) => {
//       if (processedNodes.has(nodeId)) return;
      
//       const node = dag.nodes[nodeId];
//       if (!node) return;
      
//       processedNodes.add(nodeId);
      
//       const treeNode = { 
//         id: nodeId, 
//         name: node.label,
//         type: node.type,
//         children: [] 
//       };
      
//       parent.children.push(treeNode);
      
//       node.children.forEach(childId => {
//         processNode(childId, treeNode);
//       });
//     };
    
//     // Start with root nodes
//     dag.roots.forEach(rootId => {
//       processNode(rootId, hierarchyData);
//     });
    
//     // If no root nodes were found, try to find other starting points
//     if (hierarchyData.children.length === 0 && Object.keys(dag.nodes).length > 0) {
//       Object.keys(dag.nodes).forEach(nodeId => {
//         if (!processedNodes.has(nodeId)) {
//           processNode(nodeId, hierarchyData);
//         }
//       });
//     }
    
//     // Create tree layout
//     const treeLayout = d3.tree().size([width - 80, height - 80]);
    
//     // Create root hierarchy
//     const root = d3.hierarchy(hierarchyData);
    
//     // Apply tree layout
//     treeLayout(root);
    
//     // Create links
//     svg.append('g')
//       .attr('transform', 'translate(40,40)')
//       .selectAll('path')
//       .data(root.links())
//       .enter()
//       .append('path')
//       .attr('class', 'link')
//       .attr('d', d3.linkVertical()
//         .x((d: any) => d.x)
//         .y((d: any) => d.y));
    
//     // Create node groups
//     const nodeGroup = svg.append('g')
//       .attr('transform', 'translate(40,40)')
//       .selectAll('g')
//       .data(root.descendants().filter((d: any) => d.data.id !== 'root'))
//       .enter()
//       .append('g')
//       .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
//       .attr('class', (d: any) => `node ${d.data.type}-node`);
    
//     // Add circles to nodes
//     nodeGroup.append('circle')
//       .attr('r', 20);
    
//     // Add node labels
//     nodeGroup.append('text')
//       .attr('dy', '.35em')
//       .attr('text-anchor', 'middle')
//       .text((d: any) => d.data.name)
//       .attr('fill', '#ffffff');
    
//     // Add arrowhead marker
//     svg.append('defs')
//       .append('marker')
//       .attr('id', 'arrowhead')
//       .attr('viewBox', '0 -5 10 10')
//       .attr('refX', 20)
//       .attr('refY', 0)
//       .attr('markerWidth', 6)
//       .attr('markerHeight', 6)
//       .attr('orient', 'auto')
//       .append('path')
//       .attr('d', 'M0,-5L10,0L0,5')
//       .attr('fill', '#94a3b8');
//   };
  
//   // useEffect(() => {
//   //   if (originalDAG && Object.keys(originalDAG.nodes).length > 0) {
//   //     renderDAG(originalDagRef, originalDAG);
//   //   }
//   // }, [originalDAG]);
  
//   // useEffect(() => {
//   //   if (optimizedDAG && Object.keys(optimizedDAG.nodes).length > 0) {
//   //     renderDAG(optimizedDagRef, optimizedDAG);
//   //   }
//   // }, [optimizedDAG]);
  


//   useEffect(() => {
//     if (activeTab === "original" && originalDAG && Object.keys(originalDAG.nodes).length > 0) {
//       renderDAG(originalDagRef, originalDAG);
//     }
//   }, [originalDAG, activeTab]);
  
//   useEffect(() => {
//     if (activeTab === "optimized" && optimizedDAG && Object.keys(optimizedDAG.nodes).length > 0) {
//       renderDAG(optimizedDagRef, optimizedDAG);
//     }
//   }, [optimizedDAG, activeTab]);
  
//   return (
//     <Card className="mt-8 mb-12">
//       <CardContent className="p-4">
//         <h3 className="text-xl font-bold mb-4">DAG Visualization</h3>
        
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//           <TabsList className="grid grid-cols-2 mb-6">
//             <TabsTrigger value="original">Original DAG</TabsTrigger>
//             <TabsTrigger value="optimized">Optimized DAG</TabsTrigger>
//           </TabsList>
          
//           <TabsContent value="original" className="border rounded-lg p-4">
//             <div className="h-[500px] overflow-hidden">
//               <svg ref={originalDagRef} width="100%" height="100%" />
//             </div>
//             <p className="mt-3 text-sm text-gray-600">
//               The Directed Acyclic Graph (DAG) represents the data flow of the original code.
//               Each node represents an operation, variable, or constant.
//             </p>
//           </TabsContent>
          
//           <TabsContent value="optimized" className="border rounded-lg p-4">
//             <div className="h-[500px] overflow-hidden">
//               <svg ref={optimizedDagRef} width="100%" height="100%" />
//             </div>
//             <p className="mt-3 text-sm text-gray-600">
//               After optimization, the DAG shows a more efficient representation of the code.
//               Common subexpressions have been eliminated and redundant operations removed.
//             </p>
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>
//   );
// };

// export default DAGVisualization;










import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DAGNode {
  label: string;
  type: string;
  children: string[];
}

interface DAGVisualizationProps {
  originalDAG: {
    nodes: Record<string, DAGNode>;
    roots: string[];
  };
  optimizedDAG: {
    nodes: Record<string, DAGNode>;
    roots: string[];
  };
}

const DAGVisualization: React.FC<DAGVisualizationProps> = ({ originalDAG, optimizedDAG }) => {
  const originalDagRef = useRef<SVGSVGElement>(null);
  const optimizedDagRef = useRef<SVGSVGElement>(null);
  const [activeTab, setActiveTab] = useState("original");

  const renderDAG = (
    dagRef: React.RefObject<SVGSVGElement>,
    dag: { nodes: Record<string, DAGNode>; roots: string[] }
  ) => {
    console.log("Rendering DAG...");
    if (!dagRef.current || !dag || !dag.nodes || Object.keys(dag.nodes).length === 0) {
      console.warn("Missing SVG ref or nodes to render");
      return;
    }

    console.log("DAG Ref:", dagRef.current);

    const svg = d3.select(dagRef.current);
    svg.selectAll("*").remove();

    const width = dagRef.current.clientWidth || 500;
    const height = 500;

    const hierarchyData: any = { id: "root", children: [] };
    const processedNodes = new Set<string>();

    const processNode = (nodeId: string, parent: any) => {
      if (processedNodes.has(nodeId)) return;
      const node = dag.nodes[nodeId];
      if (!node) return;

      processedNodes.add(nodeId);
      const treeNode = {
        id: nodeId,
        name: node.label,
        type: node.type,
        children: [],
      };
      parent.children.push(treeNode);
      node.children?.forEach((childId) => processNode(childId, treeNode));
    };

    if (dag.roots && dag.roots.length > 0) {
      dag.roots.forEach((rootId) => processNode(rootId, hierarchyData));
    } else {
      console.warn("No roots found, rendering all nodes as fallback.");
      Object.keys(dag.nodes).forEach((nodeId) => processNode(nodeId, hierarchyData));
    }

    const root = d3.hierarchy(hierarchyData);
    const treeLayout = d3.tree().size([width - 80, height - 80]);
    treeLayout(root);

    const g = svg.append("g").attr("transform", "translate(40,40)");

    g.selectAll("path")
      .data(root.links())
      .enter()
      .append("path")
      .attr("d", d3.linkVertical()
        .x((d: any) => d.x)
        .y((d: any) => d.y))
      .attr("stroke", "#94a3b8")
      .attr("fill", "none");

    const nodeGroup = g.selectAll("g")
      .data(root.descendants().filter((d: any) => d.data.id !== "root"))
      .enter()
      .append("g")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .attr("class", (d: any) => `node ${d.data.type}-node`);

    nodeGroup.append("circle").attr("r", 20).attr("fill", "#334155");

    nodeGroup.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text((d: any) => d.data.name)
      .attr("fill", "#ffffff");
  };

  useEffect(() => {
    console.log("Tab switched to:", activeTab);
  }, [activeTab]);

  useEffect(() => {
    console.log("Rendering Original DAG...");
    setTimeout(() => renderDAG(originalDagRef, originalDAG), 50);
  }, [originalDAG]);

  useEffect(() => {
    console.log("Rendering Optimized DAG...");
    console.log("Optimized DAG roots:", optimizedDAG.roots);
    console.log("Optimized DAG nodes:", Object.keys(optimizedDAG.nodes));

    if (activeTab === "optimized" && optimizedDAG) {
      setTimeout(() => renderDAG(optimizedDagRef, optimizedDAG), 50);
    }

    if (activeTab === "original" && originalDAG) {
      setTimeout(() => renderDAG(originalDagRef, originalDAG), 50);
    }
  }, [optimizedDAG, activeTab]);

  return (
    <Card className="mt-8 mb-12">
      <CardContent className="p-4">
        <h3 className="text-xl font-bold mb-4">DAG Visualization</h3>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="original">Original DAG</TabsTrigger>
            <TabsTrigger value="optimized">Optimized DAG</TabsTrigger>
          </TabsList>

          <TabsContent value="original" key="original-content" className="border rounded-lg p-4">
            <div className="h-[500px] overflow-hidden">
              <svg ref={originalDagRef} key="original" width="100%" height="100%" />
            </div>
          </TabsContent>

          <TabsContent value="optimized" key="optimized-content" className="border rounded-lg p-4">
            <div className="h-[500px] overflow-hidden">
              <svg ref={optimizedDagRef} key="optimized" width="100%" height="100%" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DAGVisualization;
