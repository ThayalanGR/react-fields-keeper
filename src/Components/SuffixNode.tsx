import { ISuffixNodeProps } from "../FieldsKeeper/FieldsKeeper.types"
import { FieldsKeeperContextMenu } from "./ContextMenu/FieldsKeeperContextMenu"

export const SuffixNode = (props: ISuffixNodeProps) => {
    const { fieldItem, bucketId, fieldKeeperContextMenuOptions, onOptionClick } = props;
    
    return (
        <>
            <FieldsKeeperContextMenu fieldItem={fieldItem} bucketId={bucketId} fieldKeeperContextMenuOptions={fieldKeeperContextMenuOptions} onOptionClick={onOptionClick}>
                <i
                    className="fk-ms-Icon fk-ms-Icon--ChevronDown"
                    style={{ cursor: "pointer" }}
                />
            </FieldsKeeperContextMenu>
        </>
    )
    
}