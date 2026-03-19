"use client";
import React from "react";
import { useNode, Element } from "@craftjs/core";
import { ColorPicker } from "../editor/settings/ColorPicker";
import { SpacingControl } from "../editor/settings/SpacingControl";
import { PositionControl } from "../editor/settings/PositionControl";
import { OverlayWrapper } from "../editor/settings/OverlayWrapper";

export const ContainerBlock = ({
    children,
    padding,
    margin,
    backgroundColor,
    borderRadius,
    borderColor,
    borderWidth,
    isOverlay,
    x,
    y,
    rotation = 0,
    zIndex,
    width,
    height,
}: any) => {
    const { connectors: { connect } } = useNode();

    return (
        <OverlayWrapper isOverlay={isOverlay} x={x} y={y} width={width} height={height} rotation={rotation} zIndex={zIndex}>
            <div
                ref={(ref) => { if (ref) connect(ref); }}
                className="group/container relative flex flex-col"
                style={{
                    padding,
                    margin,
                    backgroundColor,
                    borderRadius,
                    borderColor,
                    borderWidth: borderWidth ? `${borderWidth}px` : undefined,
                    borderStyle: borderWidth ? "solid" : "none",
                    width: width || "100%",
                    height: height || "100px",
                    minHeight: "100px",
                }}
            >
                <div className="absolute top-[-20px] left-0 hidden group-hover/container:block text-[10px] text-primary font-mono bg-primary/10 px-1 rounded pointer-events-none whitespace-nowrap z-50">
                    Container
                </div>
                {children}
            </div>
        </OverlayWrapper>
    );
};

export const ContainerBlockSettings = ({ isDesignTab }: { isDesignTab?: boolean }) => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    if (!isDesignTab) {
        return (
            <div className="flex flex-col space-y-4">
                <p className="text-sm text-muted-foreground">This is a structural container. Drag elements inside!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6">
            <PositionControl
                isOverlay={props.isOverlay}
                x={props.x}
                y={props.y}
                zIndex={props.zIndex}
                onChange={(prop, val) => setProp((p: any) => p[prop] = val)}
            />

            <ColorPicker
                label="Background Color"
                color={props.backgroundColor}
                onChange={(color) => setProp((p: any) => p.backgroundColor = color)}
            />

            <ColorPicker
                label="Border Color"
                color={props.borderColor}
                onChange={(color) => setProp((p: any) => p.borderColor = color)}
            />

            <div className="grid grid-cols-2 gap-4">
                <SpacingControl label="Padding" value={props.padding} onChange={(val) => setProp((p: any) => p.padding = val)} />
                <SpacingControl label="Margin" value={props.margin} onChange={(val) => setProp((p: any) => p.margin = val)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <SpacingControl label="Border Radius" value={props.borderRadius} onChange={(val) => setProp((p: any) => p.borderRadius = val)} />
                <div className="flex flex-col space-y-1">
                    <label className="text-xs text-muted-foreground">Border Width</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            value={props.borderWidth || 0}
                            onChange={(e) => setProp((p: any) => p.borderWidth = Number(e.target.value))}
                            className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors"
                        />
                        <span className="text-xs text-muted-foreground">px</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

ContainerBlock.craft = {
    displayName: "Container",
    props: {
        padding: "16px",
        margin: "0px",
        backgroundColor: "#ffffff",
        borderRadius: "0px",
        borderColor: "#e5e5e5",
        borderWidth: 1,
        isOverlay: true,
        x: -9999,
        y: -9999,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        zIndex: 10,
        width: "100%",
        height: "100px",
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: ContainerBlockSettings,
    }
};
