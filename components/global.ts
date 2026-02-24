import { Dimensions } from "react-native";

export const width=Dimensions.get('screen').width
export const height=Dimensions.get('screen').height
export const isSmallScreen=width<400
export const color={
    border:"#7A7575",
    loading:"#34A853",
    error:"#DB3E3E",

}
export const smallIconSize={
    width:width * 0.2,
    height:height * 0.04
}
export const TAB_BAR_HEIGHT = height * 0.12;