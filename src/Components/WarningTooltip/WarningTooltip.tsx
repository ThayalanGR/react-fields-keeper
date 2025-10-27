import React, { useEffect } from 'react';
import './WarningTooltip.css';

interface IWarningTooltipProps {
    /** Whether the warning tooltip is visible */
    isVisible: boolean;

    /** The warning message - can be a string or JSX element */
    message: string | JSX.Element | null;

    /** Callback function to close the warning tooltip */
    onClose: () => void;

    /** Auto-close timeout in milliseconds (only for inline mode) */
    autoCloseTimeout: number;
}

export const WarningTooltip: React.FC<IWarningTooltipProps> = ({
    isVisible,
    message,
    onClose,
    autoCloseTimeout = 3000,
}) => {
    // Auto-close effect for inline mode
    useEffect(() => {
        if (isVisible && autoCloseTimeout > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseTimeout);

            return () => clearTimeout(timer);
        }
    }, [isVisible, autoCloseTimeout, onClose]);

    if (!isVisible || !message) {
        return null;
    }

    return (
        <div className="react-fields-keeper-warning-inline" onClick={onClose}>
            {typeof message === 'string' ? (
                <div className="react-fields-keeper-warning-tooltip">
                    <div className="tooltip-box">{message}</div>
                    <div className="tooltip-arrow" />
                </div>
            ) : (
                <div className="custom-component-warning-tooltip">
                    {message}
                </div>
            )}
        </div>
    );
};
