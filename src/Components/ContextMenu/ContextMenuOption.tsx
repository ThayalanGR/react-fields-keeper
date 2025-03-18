import { IContextMenuOption } from "../../FieldsKeeper/FieldsKeeper.types";

export interface IContextMenuOptionProps {
    option: IContextMenuOption;
    contextMenuOptions?: IContextMenuOption[];
    isSubMenu: boolean;
    subMenuOptionIdHovered?: string;
    subMenuPosition?: { x: number; y: number };
    onOptionClickHandler: (option: IContextMenuOption, parentId?: string) => void;
    onMouseOver: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        option: IContextMenuOption,
        isSubMenuHover: boolean
    ) => void;
}

export const ContextMenuOption = (props: IContextMenuOptionProps) => {
    const {
        option,
        isSubMenu,
        subMenuOptionIdHovered,
        subMenuPosition,
        contextMenuOptions,
        onOptionClickHandler,
        onMouseOver,
    } = props;

    const isActiveMarker = contextMenuOptions?.some((opt) => opt.isActive);

    return (
        <div
            className="react-fields-keeper-context-menu-item"
            title={option.label}
            onClick={(e) => {
                e.stopPropagation();
                onOptionClickHandler(option);
            }}
            onMouseOver={(e) => onMouseOver(e, option, isSubMenu)}
            onMouseLeave={(e) => {
                if (e?.currentTarget?.style) {
                    e.currentTarget.style.backgroundColor = "rgb(255, 255, 255)";
                }
            }}
        >
            {isActiveMarker ? (
                option.isActive ? (
                    <i
                        className="fk-ms-Icon fk-ms-Icon--CheckMark"
                        style={{ paddingRight: "4px", fontSize: "10px" }}
                    />
                ) : (
                    <span style={{ width: "16px" }}></span>
                )
            ) : null}
            
            <span
                className="react-fields-keeper-context-menu-option-label"
                style={{ paddingLeft: isActiveMarker ? "5px" : "1px" }}
            >
                {option.label}
            </span>

            {option.subMenuOptions?.length ? (
                <>
                    <span className="react-fields-keeper-context-sub-menu-icon">
                        <i className="fk-ms-Icon fk-ms-Icon--ChevronRight" />
                    </span>
                    {subMenuOptionIdHovered === option.id && (
                        <div
                            className="react-fields-keeper-context-menu-node"
                            style={{ top: subMenuPosition?.y, left: subMenuPosition?.x }}
                        >
                            {option.subMenuOptions.map((subMenuOption) => (
                                <div key={subMenuOption.id}>
                                    <ContextMenuOption
                                        option={subMenuOption}
                                        contextMenuOptions={option.subMenuOptions}
                                        onMouseOver={onMouseOver}
                                        onOptionClickHandler={() =>
                                            onOptionClickHandler(subMenuOption, option.id)
                                        }
                                        isSubMenu={true}
                                        subMenuOptionIdHovered={subMenuOptionIdHovered}
                                        subMenuPosition={subMenuPosition}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : null}
        </div>
    );
};