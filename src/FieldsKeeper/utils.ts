import { FIELDS_KEEPER_CONSTANTS } from './FieldsKeeper.context';
import {
    IFieldsKeeperItem,
    IGroupedFieldsKeeperItem,
} from './FieldsKeeper.types';
import { sortBucketItemsBasedOnGroupOrder } from './FieldsKeeperBucket';

export function getUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        // eslint-disable-next-line no-bitwise
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function clone(item: unknown) {
    return JSON.parse(JSON.stringify(item));
}

export function findGroupItemOrder(allItems: IFieldsKeeperItem[], targetItem: IFieldsKeeperItem) {
    const groupItems = allItems.filter((item) => item.group === targetItem?.group);
    const targetIndex = groupItems.findIndex((item) => (item.sourceId ?? item.id) === (targetItem?.sourceId ?? targetItem?.id));
    return targetIndex;
}

export function getGroupedItems(
    currentItems: IFieldsKeeperItem[],
    allItems: IFieldsKeeperItem[],
    isRootBucketRender?: boolean,
): IGroupedFieldsKeeperItem[] {
    let currentGroupId = '';
    const groupedItems = currentItems.reduce<IGroupedFieldsKeeperItem[]>(
        (acc, item, fieldItemIndex) => {
            const foundGroups = acc.filter(
                (group) => group.group === item.group,
            );
            const lastGroup = foundGroups[foundGroups.length - 1];
            const lastGroupItemOrder =  findGroupItemOrder(allItems, lastGroup?.items?.[0]);
            const currentItemOrder = findGroupItemOrder(allItems, item);
            const existingGroup = acc.find((group) => group.group === item.group);
            if (existingGroup && isRootBucketRender) {
                existingGroup.items.push({
                    ...item,
                    _fieldItemIndex: fieldItemIndex,
                });
            } else if (
                lastGroup &&
                currentGroupId === item.group &&
                lastGroupItemOrder < currentItemOrder
            ) {
                lastGroup.items.push({
                    ...item,
                    _fieldItemIndex: fieldItemIndex,
                });
            } else {
                acc.push({
                    group: item.group ?? FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID,
                    groupLabel:
                        item.groupLabel ?? FIELDS_KEEPER_CONSTANTS.NO_GROUP_ID,
                    groupIcon: item.groupIcon ?? '',
                    items: [{ ...item, _fieldItemIndex: fieldItemIndex }],
                    flatGroup: item.flatGroup ?? '',
                    flatGroupLabel: item.flatGroupLabel ?? '',
                    flatGroupIcon: item.flatGroupIcon ?? '',
                });
            }
            currentGroupId = item.group ?? '';
            return acc;
        },
        [],
    );

    groupedItems.forEach((groupedItem) => {
        groupedItem.items = sortBucketItemsBasedOnGroupOrder(groupedItem.items, allItems);
    });

    return groupedItems;
}
