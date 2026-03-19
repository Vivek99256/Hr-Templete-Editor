"use client";
import React, { useEffect, useState } from "react";
import { Editor, Frame, Element, useEditor } from "@craftjs/core";
import { Topbar } from "../../../components/editor/Topbar";
import { Toolbox } from "../../../components/editor/Toolbox";
import { SettingsPanel } from "../../../components/editor/SettingsPanel";
import { EditorCanvas } from "../../../components/editor/EditorCanvas";
import { Layers } from "@craftjs/layers";
import { TextBlock } from "../../../components/blocks/TextBlock";
import { ImageBlock } from "../../../components/blocks/ImageBlock";
import { ContainerBlock } from "../../../components/blocks/ContainerBlock";
import { ButtonBlock } from "../../../components/blocks/ButtonBlock";
import { DividerBlock } from "../../../components/blocks/DividerBlock";
import { GridBlock } from "../../../components/blocks/GridBlock";
import { ShapeBlock } from "../../../components/blocks/ShapeBlock";
import { TableBlock } from "../../../components/blocks/TableBlock";
import { DrawingBlock } from "../../../components/blocks/DrawingBlock";
import { LineBlock } from "../../../components/blocks/LineBlock";
import { FloatingToolbar, WhiteboardTool } from "../../../components/editor/FloatingToolbar";
import { TemplateService } from "../../../core/services/TemplateService";
import { LocalStorageAdapter } from "../../../infrastructure/adapters/LocalStorageAdapter";

const templateService = new TemplateService(new LocalStorageAdapter());

export default function EditorPage({ params }: { params: Promise<{ templateId: string }> }) {
    const unwrappedParams = React.use(params);
    const templateId = unwrappedParams.templateId;

    const [mounted, setMounted] = useState(false);
    const [toolboxTab, setToolboxTab] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<WhiteboardTool>('select');
    const [isFloatingToolbarVisible, setIsFloatingToolbarVisible] = useState(true);

    useEffect(() => {
        setMounted(true);
        const handleReset = () => setActiveTool('select');
        window.addEventListener('reset-active-tool', handleReset);
        return () => window.removeEventListener('reset-active-tool', handleReset);
    }, []);

    if (!mounted) {
        return <div className="flex items-center justify-center h-screen bg-neutral-50"><p className="text-muted-foreground animate-pulse">Initializing Editor...</p></div>;
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Editor resolver={{ TextBlock, ImageBlock, ContainerBlock, ButtonBlock, DividerBlock, GridBlock, ShapeBlock, TableBlock, DrawingBlock, LineBlock }}>
                <Topbar templateId={templateId} />

                <div className="flex flex-1 overflow-hidden relative">
                    <div className="z-20 flex flex-col border-r border-border bg-white h-full relative" style={{ width: toolboxTab ? "368px" : "80px", transition: "width 0.3s ease-in-out" }}>
                        <Toolbox
                            activeTab={toolboxTab}
                            setActiveTab={setToolboxTab}
                            isFloatingToolbarVisible={isFloatingToolbarVisible}
                            toggleFloatingToolbar={() => setIsFloatingToolbarVisible(!isFloatingToolbarVisible)}
                        />
                    </div>

                    <div className="flex-1 flex overflow-hidden relative">
                        {isFloatingToolbarVisible && (
                            <FloatingToolbar
                                activeTool={activeTool}
                                setActiveTool={setActiveTool}
                                openToolboxTab={setToolboxTab}
                            />
                        )}
                        <EditorCanvas activeTool={activeTool}>
                            <FrameLoader templateId={templateId} />
                        </EditorCanvas>

                        <SettingsPanel />
                    </div>
                </div>
            </Editor>
        </div>
    );
}

function FrameLoader({ templateId }: { templateId: string }) {
    const { actions } = useEditor();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout | null = null;

        (async () => {
            try {
                const template = await templateService.getTemplate(templateId);
                const hasExistingData = template && template.schema && template.schema !== "{}" && template.schema !== '""' && template.schema.length > 2;

                if (hasExistingData && isMounted) {
                    // Use setTimeout to defer deserialization until after mount
                    timeoutId = setTimeout(() => {
                        if (isMounted) {
                            try {
                                actions.deserialize(template.schema);
                            } catch (err) {
                                console.error("Failed to deserialize template:", err);
                            }
                        }
                    }, 100);
                }
            } catch (err) {
                console.error("Failed to load schema", err);
            } finally {
                if (isMounted) setLoaded(true);
            }
        })();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [templateId, actions]);

    if (!loaded) return <div className="p-8 text-center text-muted-foreground flex justify-center items-center h-full">Loading workspace...</div>;

    return (
        <Frame>
            <Element is={ContainerBlock} canvas isOverlay={false} x={0} y={0} width="100%" height="100%" />
        </Frame>
    );
}
