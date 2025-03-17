import { IContextMenuOption } from "../../FieldsKeeper/FieldsKeeper.types";

export interface IContextMenuOptionProps {
    option: IContextMenuOption;
    isSubMenu: boolean;
    subMenuOptionIdHovered?: string;
    subMenuPosition?: { x: number; y: number };
    onOptionClickHandler: (option: IContextMenuOption) => void;
    onMouseOver: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, option: IContextMenuOption, isSubMenuHover: boolean) => void;
}

export const ContextMenuOption = (props: IContextMenuOptionProps) => {

    const { option, isSubMenu, subMenuOptionIdHovered, subMenuPosition, onOptionClickHandler, onMouseOver } = props;

    return (
        <>
            <div className="react-fields-keeper-context-menu-item" title={`${option.label}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onOptionClickHandler(option)
                }}
                onMouseOver={(e) => onMouseOver(e, option, isSubMenu)}
                onMouseLeave={(e) => {
                    if (e?.currentTarget?.style)
                        e.currentTarget.style.backgroundColor = "rgb(255, 255, 255)"
                }}
            >
                <span className="react-fields-keeper-context-menu-option-label">{option.label}</span>
                {option.subMenuOptions?.length ?
                    <>
                        <span className="react-fields-keeper-context-sub-menu-icon">
                            <i className="fk-ms-Icon fk-ms-Icon--ChevronRight" />
                        </span>
                        {subMenuOptionIdHovered === option.id ?
                            <div className="react-fields-keeper-context-menu-node" style={{ top: subMenuPosition?.y, left: subMenuPosition?.x }}>
                                {option.subMenuOptions.map((subMenuOption) => {
                                    return (
                                        <div key={subMenuOption.id}>
                                            <ContextMenuOption
                                                option={subMenuOption}
                                                onMouseOver={onMouseOver}
                                                onOptionClickHandler={onOptionClickHandler}
                                                isSubMenu={true}
                                                subMenuOptionIdHovered={subMenuOptionIdHovered}
                                                subMenuPosition={subMenuPosition}
                                            />
                                        </div>

                                    )
                                })
                                }
                            </div>
                            : null
                        }
                    </>
                    : null}
            </div>
        </>
    )
}