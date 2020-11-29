const { StyleSheet, css } = aphrodite

const styles = StyleSheet.create({
  block: {
    margin: '20px',
    border: '1px solid silver',
    background: '#EEF',
    padding: '10px',
  },
  heading: {
    padding: '4px',
    color: 'white',
    margin: '-10px -10px 10px -10px',
    textShadow: '2px 2px black',
    paddingLeft: '10px',
  },
})

export default Vue.component('block', {
  props: {
    heading: String,
    headingColor: {
      type: String,
      default: 'red',
    },
  },
  template: `<div class='${css(styles.block)}'>
    <div class="${css(styles.heading)}" v-bind:style="{backgroundColor: headingColor}">
      {{heading}}
    </div>    
    <slot/></div>`,
})
