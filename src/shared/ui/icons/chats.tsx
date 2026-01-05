import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

export function ChatsIcon(props: SvgProps) {
    return (
        <Svg viewBox="0 0 18 18" width={20} height={20} {...props}>
            <Path
                d="M1.366 9a7.515 7.515 0 0115.03 0v4.782c0 .796 0 1.193-.118 1.511a1.879 1.879 0 01-1.104 1.104c-.319.118-.716.118-1.512.118H8.881A7.515 7.515 0 011.366 9z"
                fill="none"
                stroke="#070A1C"
                strokeWidth={1.66667}
                strokeOpacity={1}
            />
            <Path
                d="M6.063 8.06h5.636M8.88 11.819h2.818"
                fill="none"
                stroke="#070A1C"
                strokeWidth={1.66667}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={1}
            />
        </Svg>
    );
}
