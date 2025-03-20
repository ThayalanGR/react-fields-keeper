type IconProps = React.HTMLAttributes<SVGElement>;

export const Icons = {
    table: (props: IconProps) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 20 20" {...props}>
            <path 
                d="M17 5.5A2.5 2.5 0 0 0 14.5 3h-9A2.5 2.5 0 0 0 3 5.5v9A2.5 2.5 0 0 0 5.5 17h9a2.5 2.5 0 0 0 2.5-2.5v-9Zm-13 9V13h3v3H5.36A1.5 1.5 0 0 1 4 14.5Zm8-1.5v3H8v-3h4Zm2.5 3H13v-3h3V14.64A1.5 1.5 0 0 1 14.5 16ZM12 8v4H8V8h4Zm1 0h3v4h-3V8Zm-1-4v3H8V4h4Zm1 0H14.64A1.5 1.5 0 0 1 16 5.5V7h-3V4ZM7 4v3H4V5.36A1.5 1.5 0 0 1 5.5 4H7Zm0 4v4H4V8h3Z">
            </path>
        </svg>
    ),
    checkMark: (props: IconProps) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20" {...props}>
            <path 
                d="M10 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm3.36 5.65a.5.5 0 0 0-.64-.06l-.07.06L9 11.3 7.35 9.65l-.07-.06a.5.5 0 0 0-.7.7l.07.07 2 2 .07.06c.17.11.4.11.56 0l.07-.06 4-4 .07-.08a.5.5 0 0 0-.06-.63Z" >
            </path>
        </svg>
    ),
    measure: (props: IconProps) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 20 20" {...props}>
            <path 
                d="M4.04 3.8a.5.5 0 0 1 .46-.3h11a.5.5 0 1 1 0 1H5.67l4.56 4.73a.5.5 0 0 1 .02.67l-4.68 5.6h9.93a.5.5 0 1 1 0 1h-11a.5.5 0 0 1-.38-.82L9.2 9.6 4.14 4.35a.5.5 0 0 1-.1-.55Z" >
            </path>
        </svg>
    )
};


