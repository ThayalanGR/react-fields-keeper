import React, { useEffect, useRef, useState } from "react";
import { usePopper } from 'react-popper';
import { createPortal } from "react-dom";
import { IContextMenuOption, IContextMenuProps } from "../../FieldsKeeper/FieldsKeeper.types";
import { ContextMenuOption } from "./ContextMenuOption";
import './contextMenustyle.less';

export const ContextMenu = (props: IContextMenuProps) => {
    const { children, contextMenuOptions, onOptionClick } = props;

    const menuRef = useRef<HTMLDivElement | null>(null);
    const overlayRef = useRef<HTMLDivElement | null>(null);

    const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);

    const setMenuRef = (node: HTMLDivElement | null) => {
        menuRef.current = node;
        setPopperElement(node);
    };

    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        placement: 'right-start',
    });

    const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
    const [subMenuOptionIdHovered, setSubMenuOptionIdHovered] = useState('');

    const onOutsideClick = () => {
        setIsContextMenuVisible(false);
        setSubMenuOptionIdHovered('');
    };

    const onOptionClickHandler = (option: IContextMenuOption, parentId?: string) => {
        if (option.subMenuOptions?.length) return false;
        onOptionClick(option.id, parentId);
        setIsContextMenuVisible(false);
    };

    const onContextMenuClick = () => {
        setIsContextMenuVisible(!isContextMenuVisible);
    };

    const onMouseOver = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        option: IContextMenuOption,
        isSubMenuHover = false
    ) => {
        e.persist();
        const target = e.currentTarget;

        if (target?.style) {
            target.style.backgroundColor = "rgb(243, 242, 241)";
        }

        if (option.subMenuOptions?.length && !isSubMenuHover) {
            setSubMenuOptionIdHovered(option.id);
        } else if (isSubMenuHover) {
            setSubMenuOptionIdHovered(option.id);
        } else {
            setSubMenuOptionIdHovered('');
        }
    };

    const onOverlayScroll = (e: React.WheelEvent | React.TouchEvent) => {
        e.stopPropagation();
    };

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
    }, []);

    return (
        <>
            {React.cloneElement(children, {
                ref: setReferenceElement,
                onClick: () => {
                    onContextMenuClick();
                },
            })}

            {isContextMenuVisible && createPortal(
                <div
                    ref={overlayRef}
                    className="react-fields-keeper-context-menu-underlay"
                    onWheel={onOverlayScroll}
                    onTouchMove={onOverlayScroll}
                >
                    <div
                        ref={setMenuRef}
                        className="react-fields-keeper-context-menu-node"
                        style={styles.popper}
                        {...attributes.popper}
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