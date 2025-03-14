import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CONTEXT_MENU_OPTIONS_PADDING, CONTEXT_MENU_PADDING } from "./utils";
import { IContextMenuOptions, IContextMenuProps } from "../FieldsKeeper/FieldsKeeper.types";
import { ContextMenuOption } from "./ContextMenuOption";


export const ContextMenu = (props: IContextMenuProps) => {
    const {children, contextMenuOptions, onOptionClick} = props;

    const menuRef = useRef<HTMLDivElement | null>(null);

    const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
    const [subMenuOptionIdHovered, setSubMenuOptionIdHovered] = useState('');
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [subMenuPosition, setSubMenuPosition] = useState({ x: 0, y: 0 });

    const onOutsideClick = () => {
        setIsContextMenuVisible(false);
        setSubMenuOptionIdHovered('');
    };

    const onOptionClickHandler = (option:IContextMenuOptions) => {
        if(option.subMenuOptions?.length) {
            return false;
        }
        onOptionClick(option.id);
        setIsContextMenuVisible(false);
    };

    const onContextMenuClick = (e?: React.MouseEvent) => {
        if(e){
            setIsContextMenuVisible(!isContextMenuVisible);
            setPosition({ x: e.clientX + CONTEXT_MENU_OPTIONS_PADDING, y: e.clientY });
        }
    };

    const onMouseOver = (e:  React.MouseEvent<HTMLDivElement, MouseEvent>, option: IContextMenuOptions, isSubMenuHover = false ) => {
        if(e?.currentTarget) {
            if(e.currentTarget.style){
                e.currentTarget.style.backgroundColor = "rgb(243, 242, 241)";
            }

            if(option.subMenuOptions?.length && !isSubMenuHover) {
                const rect = e.currentTarget.getBoundingClientRect();
                if(rect) {
                    setSubMenuPosition({ x: (rect.x + rect.width) + CONTEXT_MENU_OPTIONS_PADDING, y: rect.y });
                    setSubMenuOptionIdHovered(option.id);
                }
            } else if(isSubMenuHover) {
                setSubMenuOptionIdHovered(option.id);
            }else {
                setSubMenuOptionIdHovered('');
            }
        }
    }

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
                <div ref={menuRef} className="context-menu-node"
                    style={{
                        top: position.y ,
                        left: position.x ?? 0 + CONTEXT_MENU_PADDING,
                    }}
                >
                    {contextMenuOptions.map((option) => (
                        <div key={option.id}>
                            <ContextMenuOption 
                                key={option.id}
                                option={option} 
                                onMouseOver={onMouseOver} 
                                onOptionClickHandler={onOptionClickHandler} 
                                isSubMenu={false}
                                subMenuOptionIdHovered={subMenuOptionIdHovered}
                                subMenuPosition={subMenuPosition}
                            />
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
};