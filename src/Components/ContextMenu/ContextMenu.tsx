import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CONTEXT_MENU_PADDING } from "./utils";
import { IContextMenuOption, IContextMenuProps } from "../../FieldsKeeper/FieldsKeeper.types";
import { ContextMenuOption } from "./ContextMenuOption";
import './contextMenustyle.less';

export const ContextMenu = (props: IContextMenuProps) => {
    const { children, contextMenuOptions, onOptionClick } = props;

    const menuRef = useRef<HTMLDivElement | null>(null);
    const overlayRef = useRef<HTMLDivElement | null>(null);

    const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
    const [subMenuOptionIdHovered, setSubMenuOptionIdHovered] = useState('');
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [subMenuPosition, setSubMenuPosition] = useState({ x: 0, y: 0 });

    const onOutsideClick = () => {
        setIsContextMenuVisible(false);
        setSubMenuOptionIdHovered('');
    };

    const onOptionClickHandler = (option: IContextMenuOption, parentId?: string) => {
        if (option.subMenuOptions?.length) {
            return false;
        }
        onOptionClick(option.id, parentId);
        setIsContextMenuVisible(false);
    };

    const onContextMenuClick = (e?: React.MouseEvent) => {
        if (e) {
            setIsContextMenuVisible(!isContextMenuVisible);
            setPosition({ x: e.clientX + CONTEXT_MENU_PADDING, y: e.clientY });
        }
    };

    const onMouseOver = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, option: IContextMenuOption, isSubMenuHover = false) => {
        if (e?.currentTarget) {
            if (e.currentTarget.style) {
                e.currentTarget.style.backgroundColor = "rgb(243, 242, 241)";
            }

            if (option.subMenuOptions?.length && !isSubMenuHover) {
                const rect = e.currentTarget.getBoundingClientRect();
                if (rect) {
                    setSubMenuPosition({ x: (rect.x + rect.width), y: rect.y });
                    setSubMenuOptionIdHovered(option.id);
                }
            } else if (isSubMenuHover) {
                setSubMenuOptionIdHovered(option.id);
            } else {
                setSubMenuOptionIdHovered('');
            }
        }
    }

    const onOverlayScroll = (e: React.WheelEvent | React.TouchEvent) => {
        e.stopPropagation();
    }

    const preventScroll = (e: Event) => {
        e.preventDefault();
    };

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onOutsideClick();
            }
        };

        const overlay = overlayRef.current;
        if (overlay) {
            overlay.addEventListener("wheel", preventScroll, { passive: false });
            overlay.addEventListener("touchmove", preventScroll, { passive: false });
        }

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            if (overlay) {
                overlay.removeEventListener("wheel", preventScroll);
                overlay.removeEventListener("touchmove", preventScroll);
            }
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    });

    return (
        <>
            <div onClick={onContextMenuClick}>
                {children}
            </div>

            {isContextMenuVisible && createPortal(
                <div ref={overlayRef} className="react-fields-keeper-context-menu-underlay" onWheel={onOverlayScroll} onTouchMove={onOverlayScroll}>
                    <div ref={menuRef} className="react-fields-keeper-context-menu-node"
                        style={{
                            top: position.y,
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
                                    contextMenuOptions={contextMenuOptions}
                                />
                                { option.showSeparator ? <div className="react-fields-keeper-separator"> </div> : null }
                            </div>
                        ))}
                    </div>
                </div>
                , document.body
            )}
        </>
    );
};