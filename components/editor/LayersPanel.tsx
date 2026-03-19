"use client";
import React from "react";
import { useEditor } from "@craftjs/core";
import { Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";

export const LayersPanel = () => {
    const { nodes, actions, query } = useEditor((state) => ({
        nodes: state.nodes,
    }));
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({ ROOT: true });
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editValue, setEditValue] = React.useState("");

    // Helper function to get display name from node
    const getDisplayName = (node: any): string => {
        if (!node) return 'Unknown';
        if (!node.data) return `Block ${node.id?.slice(0, 8) || 'unknown'}`;
        
        const nodeName = node.data.name as string;
        const props = node.data.props || {};
        
        // Check for custom name first (user renamed it)
        if (props.customName) {
            return props.customName;
        }
        
        // Special handling for ROOT/Frame - use template name if available
        if (nodeName === 'Frame' || nodeName === 'Container') {
            // Check if this is the root container
            if (!node.data.parent) {
                return 'Template';
            }
        }
        
        // Map of component names to their displayName functions
        const displayNameMap: Record<string, (props: any) => string> = {
            'ShapeBlock': (p: any) => {
                const shapeNames: Record<string, string> = {
                    'square': 'Square',
                    'rounded-square': 'Rounded Square',
                    'circle': 'Circle',
                    'triangle': 'Triangle',
                    'diamond': 'Diamond',
                    'pentagon': 'Pentagon',
                    'hexagon': 'Hexagon',
                    'octagon': 'Octagon',
                    'star': 'Star',
                    'cross': 'Cross',
                    'arrow': 'Arrow',
                    'parallelogram': 'Parallelogram',
                    'trapezoid': 'Trapezoid',
                    'right-triangle': 'Right Triangle',
                    'chevron': 'Chevron',
                    'ribbon': 'Ribbon',
                    'message': 'Message',
                    'tag': 'Tag',
                    'shield': 'Shield',
                    'stairs': 'Stairs',
                    'beveled': 'Beveled',
                };
                const shapeType = p?.shapeType || 'square';
                const baseName = shapeNames[shapeType] || `Shape ${shapeType}`;
                const instanceNum = p?.instanceNumber;
                return instanceNum ? `${baseName} ${instanceNum}` : baseName;
            },
            'TextBlock': (p: any) => p?.html ? `Text: ${p.html.substring(0, 20)}...` : 'Text',
            'ImageBlock': (p: any) => p?.src ? `Image: ${p.src.substring(0, 15)}...` : 'Image',
            'ContainerBlock': (p: any) => {
                // Check if it's the root container (no parent)
                const isRoot = !node.data.parent;
                return isRoot ? 'Template' : 'Container';
            },
            'ButtonBlock': () => 'Button',
            'DividerBlock': () => 'Divider',
            'GridBlock': () => 'Grid',
            'TableBlock': () => 'Table',
            'DrawingBlock': () => 'Drawing',
            'LineBlock': (p: any) => `Line: ${p?.lineType || 'default'}`,
        };
        
        // Check if we have a custom displayName function for this component
        if (nodeName && displayNameMap[nodeName]) {
            return displayNameMap[nodeName](props);
        }
        
        // Fallback to node.data.name
        return nodeName || `Block ${node.id?.slice(0, 8) || 'unknown'}`;
    };

    // Get the node tree
    const nodeTree = React.useMemo(() => {
        const buildTree = (parentId: string | null): any[] => {
            if (!parentId) {
                // Root level nodes
                return Object.values(nodes)
                    .filter((node) => !node.data.parent)
                    .map((node) => ({
                        id: node.id,
                        name: getDisplayName(node),
                        children: buildTree(node.id),
                    }));
            }
            
            return Object.values(nodes)
                .filter((node) => node.data.parent === parentId)
                .map((node) => ({
                    id: node.id,
                    name: getDisplayName(node),
                    children: buildTree(node.id),
                }));
        };

        return buildTree(null);
    }, [nodes]);

    const toggleExpand = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDelete = (id: string) => {
        const isDeletable = query.node(id).isDeletable();
        if (isDeletable) {
            actions.delete(id);
        }
    };

    const handleRename = (id: string, newName: string) => {
        // Store custom name in node props using a custom 'customName' prop
        const node = query.node(id).get();
        if (node) {
            actions.setProp(id, (prop: any) => {
                prop.customName = newName;
            });
        }
        setEditingId(null);
    };

    const startEditing = (id: string, currentName: string) => {
        setEditingId(id);
        setEditValue(currentName);
    };

    const renderNode = (node: any, depth: number = 0) => {
        const isExpanded = expanded[node.id] !== false;
        const hasChildren = node.children && node.children.length > 0;
        const isDeletable = query.node(node.id).isDeletable();
        const isEditing = editingId === node.id;
        const displayName = getDisplayName(nodes[node.id]);

        return (
            <div key={node.id}>
                <div
                    className="select-none flex items-center py-1.5 px-2 cursor-pointer transition-colors text-xs hover:bg-neutral-100"
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                    onClick={() => (actions as any).selectNode(node.id)}
                >
                    <button
                        className={`p-0.5 hover:bg-neutral-200 rounded mr-1 transition-colors ${!hasChildren && 'invisible'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(node.id);
                        }}
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-neutral-500" />
                        ) : (
                            <ChevronRight className="w-3 h-3 text-neutral-500" />
                        )}
                    </button>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleRename(node.id, editValue)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename(node.id, editValue);
                                if (e.key === 'Escape') setEditingId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="flex-1 px-1 py-0.5 text-xs border border-sky-500 rounded outline-none"
                        />
                    ) : (
                        <span 
                            className="truncate flex-1 font-medium text-neutral-700 cursor-text"
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                startEditing(node.id, displayName);
                            }}
                        >
                            {displayName}
                        </span>
                    )}
                    {isDeletable && !isEditing && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(node.id);
                            }}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 transition-opacity"
                            title="Delete"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    )}
                </div>
                {isExpanded && hasChildren && node.children.map((child: any) => renderNode(child, depth + 1))}
            </div>
        );
    };

    return (
        <div className="w-full">
            <div className="px-2 py-2 flex items-center justify-between bg-neutral-50 border-b">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Layers
                </span>
            </div>
            <div className="py-1">
                {nodeTree.map((node) => renderNode(node))}
            </div>
        </div>
    );
};
