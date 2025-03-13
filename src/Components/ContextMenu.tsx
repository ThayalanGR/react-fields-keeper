import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CONTEXT_MENU_PADDING } from "./utils";
import { IContextMenuProps } from "../FieldsKeeper/FieldsKeeper.types";


export const ContextMenu = (props: IContextMenuProps) => {
    const {children, contextMenuOptions, onOptionClick} = props;

    const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const onOutsideClick = () => {
        setIsContextMenuVisible(false);
    };

    const onOptionClickHandler = (id: string) => {
        onOptionClick(id);
        setIsContextMenuVisible(false);
    };

    const onContextMenuClick = (e?: React.MouseEvent) => {
        if(e){
            e.preventDefault();
            setIsContextMenuVisible(true);
            setPosition({ x: e.clientX, y: e.clientY });
        }
    };

    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onOutsideClick();
            }
            document.body.style.overflow = 'unset';
        };

        if (isContextMenuVisible && typeof window != 'undefined' && window.document) {
            document.body.style.overflow = 'hidden';
        }

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    });

    return (
        <>
            <div onClick={onContextMenuClick}>
                {children}
            </div>

            {isContextMenuVisible && createPortal(
                <div
                    ref={menuRef}
                    className="context-menu-node"
                    style={{
                        top: position.y ,
                        left: position.x ?? 0 + CONTEXT_MENU_PADDING,
                    }}
                >
                    {contextMenuOptions.map((option) => (
                        <div
                            key={option.id}
                            onClick={() => onOptionClickHandler(option.id)}
                            style={{ padding: "4px 8px", cursor: "pointer", fontSize: 12 }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
};