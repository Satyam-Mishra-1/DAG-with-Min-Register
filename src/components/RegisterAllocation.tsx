import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TACInstruction } from '@/utils/tacParser';
import * as d3 from 'd3';

interface RegisterAllocationProps {
  interferenceGraph: Record<string, string[]>;
  registerMapping: Record<string, string>;
  optimizedWithRegisters: TACInstruction[];
}

const RegisterAllocation: React.FC<RegisterAllocationProps> = ({ 
  interferenceGraph, 
  registerMapping,
  optimizedWithRegisters 
}) => {
  const graphRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!graphRef.current || !interferenceGraph || Object.keys(interferenceGraph).length === 0) return;

    const renderGraph = () => {
      const svg = d3.select(graphRef.current);
      svg.selectAll("*").remove();

      const width = graphRef.current.clientWidth;
      const height = graphRef.current.clientHeight;

      const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id((d: any) => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2))
        .force("y", d3.forceY(height / 2));

      const nodes = Object.keys(interferenceGraph).map(variable => ({
        id: variable,
        register: registerMapping[variable] || 'None'
      }));

      const links: { source: string; target: string }[] = [];
      Object.entries(interferenceGraph).forEach(([variable, neighbors]) => {
        neighbors.forEach(neighbor => {
          links.push({
            source: variable,
            target: neighbor
          });
        });
      });

      svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#94a3b8");

      const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("class", "link")
        .attr("stroke-width", 1.5)
        .attr("stroke", "#94a3b8")
        .attr("marker-end", "url(#arrowhead)");

      const node = svg.append("g")
        .selectAll(".node")
        .data(nodes)
        .join("g")
        .attr("class", "node")
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

      node.append("circle")
        .attr("r", 20)
        .attr("class", "register-node")
        .attr("fill", "#4f46e5");

      node.append("text")
        .attr("x", 0)
        .attr("y", -25)
        .attr("text-anchor", "middle")
        .text((d: any) => d.id)
        .attr("font-size", "14px")
        .attr("fill", "#4f46e5");

      node.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .text((d: any) => d.register)
        .attr("font-size", "12px")
        .attr("fill", "white");

      simulation.nodes(nodes as any).on("tick", () => {
        link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);

        node
          .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      });

      simulation.force<d3.ForceLink<any, any>>("link")?.links(links as any);

      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
    };

    renderGraph();

    const handleResize = () => renderGraph();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [interferenceGraph, registerMapping]);

  return (
    <Card className="mt-8">
      <CardContent className="p-4">
        <h3 className="text-xl font-bold mb-4">Register Allocation</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold mb-3">Inference Graph</h4>
            <div className="border rounded-lg h-[400px] overflow-hidden">
              <svg ref={graphRef} className="w-full h-full" />
            </div>
            <p className="mt-3 text-sm text-gray-600">
              The inference graph shows variables that interfere with each other and cannot share the same register.
              Colors indicate register assignments.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">Optimized Code with Registers</h4>
            <div className="font-mono text-sm bg-code text-code-foreground p-4 rounded-md overflow-auto h-[400px]">
              <pre className="whitespace-pre-wrap">
                {optimizedWithRegisters.map((instr, index) => (
                  <div 
                    key={`register-code-${index}`}
                    className="py-1 border-b border-gray-700 last:border-0">
                    <span className="mr-2 text-gray-400">{instr.lineNumber}:</span>
                    {instr.raw}
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterAllocation;
