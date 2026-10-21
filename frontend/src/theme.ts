import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#eef1ff",
      100: "#d6ddff",
      200: "#b3c0ff",
      300: "#8b9dff",
      400: "#6b81fb",
      500: "#5b7cfa",
      600: "#4a63d8",
      700: "#3a4dab",
      800: "#2b397d",
      900: "#1d2654",
    },
    surface: {
      900: "#0b0e13",
      800: "#121720",
      700: "#171d28",
      600: "#1e2532",
      500: "#26303f",
    },
  },
  fonts: {
    heading:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: "surface.900",
        color: "#e9ecf2",
      },
      "*::selection": {
        bg: "brand.600",
        color: "white",
      },
    },
  },
  components: {
    Button: {
      baseStyle: { borderRadius: "10px", fontWeight: 600 },
      /**
       * Chakra's default dark-mode solid button uses the 200 shade with dark
       * text. Override it so primary actions stay saturated on the dark UI.
       */
      variants: {
        solid: (props: { colorScheme: string }) => {
          const scheme = props.colorScheme;
          return {
            bg: `${scheme}.500`,
            color: "white",
            _hover: {
              bg: `${scheme}.600`,
              _disabled: { bg: `${scheme}.500` },
            },
            _active: { bg: `${scheme}.700` },
            _disabled: { bg: `${scheme}.500`, opacity: 0.45, cursor: "not-allowed" },
          };
        },
      },
      defaultProps: { colorScheme: "brand" },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: "surface.700",
            borderColor: "surface.500",
            _hover: { borderColor: "surface.500" },
            _focusVisible: { borderColor: "brand.500", boxShadow: "0 0 0 1px #5b7cfa" },
          },
        },
      },
      defaultProps: { variant: "outline" },
    },
    Textarea: {
      variants: {
        outline: {
          bg: "surface.700",
          borderColor: "surface.500",
          _focusVisible: { borderColor: "brand.500", boxShadow: "0 0 0 1px #5b7cfa" },
        },
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            bg: "surface.700",
            borderColor: "surface.500",
            _focusVisible: { borderColor: "brand.500", boxShadow: "0 0 0 1px #5b7cfa" },
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: { bg: "surface.800", borderRadius: "16px" },
        overlay: { bg: "blackAlpha.700" },
      },
    },
    Menu: {
      baseStyle: {
        list: { bg: "surface.700", borderColor: "surface.500" },
        item: { bg: "surface.700", _hover: { bg: "surface.600" }, _focus: { bg: "surface.600" } },
      },
    },
    Table: {
      baseStyle: {
        th: { borderColor: "surface.500", color: "gray.400" },
        td: { borderColor: "surface.600" },
      },
    },
    Divider: { baseStyle: { borderColor: "surface.500" } },
  },
});
