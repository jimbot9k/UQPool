import { StyleSheet } from "react-native";
import { withTheme } from "react-native-elements";

export const COLORS = {
  primary: "#65388E",
  secodary: "#65388E",
  tertiary: "#65388E",
  purple: "#65388E",
};

export const BOX = {
  borderRadius: 20,
};

export const LINE = {
   width: 1
};

export const FONT_SIZE = {
  heading2: 23,
  heading3: 20,
  text: 18,
};

export const box = StyleSheet.create({
  shadows: {
    shadowOffset: { height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowColor: "gray",
    elevation: 3
  },
  base: {
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
  }
});

export const cantPress = StyleSheet.create({
  opacity: 0.2
});