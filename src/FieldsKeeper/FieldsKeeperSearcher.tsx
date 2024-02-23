import classNames from 'classnames';
import React, { MutableRefObject, forwardRef, useRef } from 'react';

export interface IFieldsKeeperSearcherProps {
    searchQuery: string;
    searchPlaceholder?: string;
    className?: string;
    onSearchQueryChange: (value: string) => void;
}

const FieldsKeeperSearcher = forwardRef<
    HTMLInputElement,
    IFieldsKeeperSearcherProps
>((props, ref) => {
    // props
    const { className, searchPlaceholder, searchQuery, onSearchQueryChange } =
        props;

    // refs
    const searchInputRef = useRef<HTMLInputElement>(null);

    // actions
    const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchQueryChange(e.target.value ?? '');
    };

    const onClearSearchQuery = () => {
        onSearchQueryChange('');
        if (ref) (ref as MutableRefObject<HTMLDivElement>)?.current?.focus();
        else searchInputRef.current?.focus();
    };

    // props
    return (
        <div
            className={classNames(
                'react-fields-keeper-mapping-column-searcher',
                className,
            )}
        >
            <div className="react-fields-keeper-mapping-column-searcher-prefix">
                <span className="fk-ms-Icon fk-ms-Icon--Search" />
            </div>
            <input
                className="react-fields-keeper-mapping-column-searcher-input"
                type="text"
                ref={ref ?? searchInputRef}
                onChange={onSearchInputChange}
                value={searchQuery}
                placeholder={searchPlaceholder}
            />
            {searchQuery.length > 0 && (
                <div
                    className="react-fields-keeper-mapping-column-searcher-clear"
                    role="button"
                    onClick={onClearSearchQuery}
                >
                    <span className="fk-ms-Icon fk-ms-Icon--ChromeClose" />
                </div>
            )}
        </div>
    );
});

export default FieldsKeeperSearcher;
