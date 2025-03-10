/** @type { import('@storybook/vue3').Preview } */

import "zs-base-ui/dist/index.css";
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
