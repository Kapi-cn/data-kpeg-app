import { createStore } from 'solid-js/store';

export const [sidebar, setSidebar] = createStore({
  isOpen: false,
});

export const toggleSidebar = () => {
  setSidebar('isOpen', val => !val);
};

export const closeSidebar = () => {
  setSidebar("isOpen", false);
};
