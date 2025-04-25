import { ISuffixNodeProps } from '../FieldsKeeper/FieldsKeeper.types';
import { ContextMenu } from './ContextMenu/ContextMenu';

export const SuffixNode = (props: ISuffixNodeProps) => {
    const { contextMenuOptions, onOptionClick } = props;

    return (
        <ContextMenu
            contextMenuOptions={contextMenuOptions}
            onOptionClick={onOptionClick}
        >
            <i
                className="fk-ms-Icon fk-ms-Icon--MoreVertical"
                style={{ cursor: 'pointer' }}
            />
        </ContextMenu>
    );
};
