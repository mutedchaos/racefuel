const { StyleSheet, css } = aphrodite

const styles = StyleSheet.create({
  main: {
    background: 'red',
    padding: '10px',
    color: 'white',
    fontStyle: 'italic',
    fontSize: '1.5em',
    textShadow: '2px 2px black',
  },
})

export const appHeader = Vue.component('appHeader', {
  template: `<header class="${css(styles.main)}">Race Fuel</header>`,
})
